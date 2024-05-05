import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  //validate channelId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID!!");
  }

  //check if channel exists
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found!!");
  }

  //check if user is trying to subscribe to his own channel
  if (req.user.id === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel!!");
  }

  //check if user is already subscribed to channel
  const subscription = await Subscription.findOne({
    subscriber: req.user.id,
    channel: channelId,
  });

  //toggle subscription
  if (subscription) {
    //unsubscribe user from channel
    await Subscription.findByIdAndDelete(subscription.id);
    //return response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully!!"));
  } else {
    //subscribe user to channel
    await Subscription.create({
      subscriber: req.user.id,
      channel: channelId,
    });
    //return response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Subscribed successfully!!"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  //validate channelId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID!!");
  }

  //check if channel exists
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found!!");
  }

  //get subscribers of channel
  const subscribers = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $project: {
        _id: 0,
        subscriber: {
          _id: 1,
          username: 1,
          fullName: 1,
          email: 1,
          avatart: 1,
        },
      },
    },
  ]);

  //return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully!!")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  //validate subscriberId
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID!!");
  }

  //check if subscriber exists
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, "Subscriber not found!!");
  }

  //get subscribed channels of user
  const channels = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $project: {
        _id: 0,
        channel: {
          _id: 1,
          username: 1,
          fullName: 1,
          email: 1,
          avatart: 1,
        },
      },
    },
  ]);

  //return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels,
        "Subscribed channels fetched successfully!!"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
