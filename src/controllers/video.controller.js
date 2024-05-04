import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  //TODO: DISCOVER why userID is being passed in the query, is it really necessary?
  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          {
            title: {
              $regex: query,
              $options: "i",
            },
          },
          {
            description: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (Number(page) - 1) * limit,
    },
    {
      $limit: Number(limit),
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        isPublished: 1,
        createdAt: 1,
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully!!"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  //get video file and thumbnail
  const videoFilePath = req.files.videoFile[0].path;
  const thumbnailPath = req.files.thumbnail[0].path;

  //check if video file and thumbnail are available
  if (title === "" || description === "") {
    new ApiError(400, "Title and description are required!!");
  }
  if (!videoFilePath || !thumbnailPath) {
    new ApiError(400, "Video file and thumbnail are required!!");
  }

  //upload video and thumbnail to cloudinary
  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!videoFile || !thumbnail) {
    new ApiError(400, "Video and thumbnail upload failed!!");
  }

  //create video
  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    owner: req.user._id,
    duration: videoFile.duration,
  });

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully!!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //validate video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },

    {
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  //check if video is available
  if (video.length === 0) {
    res.status(404).json(new ApiResponse(404, {}, "Video not found!!"));
    return;
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  //validate video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!");
  }

  //check if title and description are available
  if (title === "" && description === "") {
    //nothing to update
    res.status(400).json(new ApiResponse(400, {}, "Nothing to update!!"));
    return;
  }

  //update video
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      title: title,
      description: description,
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully!!"));
});

const updateVideoThumbnail = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const thumbnailPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!");
  }

  //check if thumbnail is available
  if (!thumbnailPath) {
    new ApiError(400, "Thumbnail is required!!");
  }

  //upload thumbnail to cloudinary
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!thumbnail) {
    new ApiError(400, "Thumbnail upload failed!!");
  }

  //delete old thumbnail
  const video = await Video.findById(videoId);
  if (video.thumbnail) {
    const publicId = video.thumbnail.split("/").pop().split(".")[0];
    console.log(publicId);
    await deleteFromCloudinary(publicId);
  }

  //update video thumbnail
  video.thumbnail = thumbnail.url;
  await video.save({ validateBeforeSave: false });

  res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video thumbnail updated successfully!!")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //validate video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is required!!");
  }

  //delete video from cloudinary
  const video = await Video.findById(videoId);
  if (video.videoFile) {
    const publicId = video.videoFile.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }
  if (video.thumbnail) {
    const publicId = video.thumbnail.split("/").pop().split(".")[0];
    await deleteFromCloudinary(publicId);
  }

  //delete video
  await Video.findByIdAndDelete(videoId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully!!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //validate video id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id!!");
  }

  //toggle video publish status
  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  //return response
  res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully!!")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
};
