import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate name and description
  if (name.trim() === "" || description.trim() === "") {
    throw new ApiError(400, "Name and description cannot be empty!!");
  }

  // Create playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  //return response
  res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully!!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  //validate userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID!!");
  }

  // Get user playlists
  const playlists = await Playlist.find({ owner: userId });

  //return response
  res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully!!")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  //validate playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!!");
  }

  // Get playlist by ID
  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
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
        name: 1,
        description: 1,
        videos: {
          _id: 1,
          title: 1,
          description: 1,
        },
        owner: {
          _id: 1,
          username: 1,
          fullName: 1,
          email: 1,
          avatar: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully!!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  //validate playlistId and videoId
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID!!");
  }

  // check if video owner is the same as playlist owner
  const video = await Video.findById(videoId);
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only add your own videos to playlist!!");
  }

  // check if video exists in playlist
  const playlist = await Playlist.findById(playlistId);
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already exists in playlist!!");
  }

  // Add video to playlist
  playlist.videos.push(videoId);
  await playlist.save();

  //return response
  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully!!")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  //validate playlistId and videoId
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist ID or video ID!!");
  }

  // check if video exists in playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video does not exist in playlist!!");
  }

  // Remove video from playlist
  playlist.videos = playlist.videos.filter(
    (video) => video.toString() !== videoId
  );
  await playlist.save();

  //return response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Video removed from playlist successfully!!"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  //validate playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!!");
  }

  //check if playlist exists
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found!!");
  }

  //check if user is the owner of the playlist
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own playlists!!");
  }

  // Delete playlist
  await Playlist.findByIdAndDelete(playlistId);

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully!!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  //validate playlistId
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID!!");
  }

  //validate name and description
  if (name.trim() === "" || description.trim() === "") {
    //nothing to update
    res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "Playlist not updated!! name or description or both empty!!"
        )
      );
    return;
  }

  //check if user is the owner of the playlist
  const playlist = await Playlist.findById(playlistId);
  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own playlists!!");
  }

  // Update playlist
  playlist.name = name;
  playlist.description = description;
  await playlist.save();

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully!!"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
