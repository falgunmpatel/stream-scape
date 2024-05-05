import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  // get the total views of all the videos of the channel
  const totalViews = await Video.aggregate([
    { $match: { owner: req.user._id } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  // get the total subscribers of the channel - another controller getUserChannelSubscribers is already implemented for this purpose

  //get the total videos of the channel
  const totalVideos = await Video.find({ owner: req.user._id });

  // get the total likes of all the videos of the channel
  const totalLikes = await Like.aggregate([
    {
      $match: {
        likeType: "like",
        video: {
          $in: totalVideos.map((video) => video._id),
        },
      },
    },
    { $group: { _id: null, totalLikes: { $sum: 1 } } },
  ]);

  // return the channel stats
  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalViews: totalViews[0].totalViews || 0,
        totalVideos: totalVideos.length || 0,
        totalLikes: totalLikes[0].totalLikes || 0,
      },
      "Channel stats fetched successfully!!"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // get all the videos of the channel
  const channelVideos = await Video.find({ owner: req.user._id }).select({
    _id: 1,
    title: 1,
    description: 1,
    thumbnail: 1,
    duration: 1,
    views: 1,
    isPublished: 1,
    onwer: 1,
    createdAt: 1,
  });

  //return the channel videos
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelVideos,
        "Channel videos fetched successfully!!"
      )
    );
});

export { getChannelStats, getChannelVideos };
