import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  // Validate content
  if (content.trim() === "") {
    throw new ApiError(400, "Content cannot be empty!!");
  }

  // Create tweet
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  //return response
  res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully!!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id!!");
  }

  // Get user tweets
  const tweets = await Tweet.find({ owner: userId });

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, tweets, "User tweets fetched successfully!!"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id!!");
  }

  // Validate content
  if (content.trim() === "") {
    // nothing to update
    res
      .status(400)
      .json(
        new ApiResponse(400, {}, "Tweet not updated!! Tweet Content Empty!!")
      );
    return;
  }

  // Update tweet
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: content,
    },
    { new: true }
  );

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully!!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Validate tweetId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id!!");
  }

  // Delete tweet
  await Tweet.findByIdAndDelete(tweetId);

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully!!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
