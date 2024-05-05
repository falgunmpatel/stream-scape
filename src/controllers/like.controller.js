import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if videoId is a valid ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  //check if user has already disliked the video
  const dislike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  //If user has already disliked the video, remove the dislike
  if (dislike) {
    await Like.findByIdAndDelete(dislike._id);
  }

  // Check if user has already liked the video
  const like = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
    likeType: "like",
  });

  if (like) {
    // If user has already liked the video, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(200).json(new ApiResponse(200, {}, "Like removed!!"));
  } else {
    // If user has not liked the video, add a like
    const newLike = new Like({
      video: videoId,
      likedBy: req.user._id,
      likeType: "like",
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Video liked!!"));
  }
});

const toggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Check if videoId is a valid ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!!");
  }

  // Check if user has already liked the video
  const like = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
    likeType: "like",
  });

  // If user has already liked the video, remove the like
  if (like) {
    await Like.findByIdAndDelete(like._id);
  }

  // Check if user has already disliked the video
  const dislike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  if (dislike) {
    // If user has already disliked the video, remove the dislike
    await Like.findByIdAndDelete(dislike._id);
    return res.status(200).json(new ApiResponse(200, {}, "Dislike removed!!"));
  } else {
    // If user has not disliked the video, add a dislike
    const newDislike = new Like({
      video: videoId,
      likedBy: req.user._id,
      likeType: "dislike",
    });
    await newDislike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Video disliked!!"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Check if commentId is a valid ObjectId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found!!");
  }

  //check if user has already disliked the comment
  const dislike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  //If user has already disliked the comment, remove the dislike
  if (dislike) {
    await Like.findByIdAndDelete(dislike._id);
  }

  // Check if user has already liked the comment
  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
    likeType: "like",
  });

  if (like) {
    // If user has already liked the comment, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(200).json(new ApiResponse(200, {}, "Like removed!!"));
  } else {
    // If user has not liked the comment, add a like
    const newLike = new Like({
      comment: commentId,
      likedBy: req.user._id,
      likeType: "like",
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Comment liked!!"));
  }
});

const toggleCommentDislike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Check if commentId is a valid ObjectId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found!!");
  }

  // Check if user has already liked the comment
  const like = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
    likeType: "like",
  });

  // If user has already liked the comment, remove the like
  if (like) {
    await Like.findByIdAndDelete(like._id);
  }

  // Check if user has already disliked the comment
  const dislike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  if (dislike) {
    // If user has already disliked the comment, remove the dislike
    await Like.findByIdAndDelete(dislike._id);
    return res.status(200).json(new ApiResponse(200, {}, "Dislike removed!!"));
  } else {
    // If user has not disliked the comment, add a dislike
    const newDislike = new Like({
      comment: commentId,
      likedBy: req.user._id,
      likeType: "dislike",
    });
    await newDislike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Comment disliked!!"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Check if tweetId is a valid ObjectId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  // Check if tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found!!");
  }

  //check if user has already disliked the tweet
  const dislike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  //If user has already disliked the tweet, remove the dislike
  if (dislike) {
    await Like.findByIdAndDelete(dislike._id);
  }

  // Check if user has already liked the tweet
  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
    likeType: "like",
  });

  if (like) {
    // If user has already liked the tweet, remove the like
    await Like.findByIdAndDelete(like._id);
    return res.status(200).json(new ApiResponse(200, {}, "Like removed!!"));
  } else {
    // If user has not liked the tweet, add a like
    const newLike = new Like({
      tweet: tweetId,
      likedBy: req.user._id,
      likeType: "like",
    });
    await newLike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Tweet liked!!"));
  }
});

const toggleTweetDislike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Check if tweetId is a valid ObjectId
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  // Check if tweet exists
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found!!");
  }

  // Check if user has already liked the tweet
  const like = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
    likeType: "like",
  });

  // If user has already liked the tweet, remove the like
  if (like) {
    await Like.findByIdAndDelete(like._id);
  }

  // Check if user has already disliked the tweet
  const dislike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
    likeType: "dislike",
  });

  if (dislike) {
    // If user has already disliked the tweet, remove the dislike
    await Like.findByIdAndDelete(dislike._id);
    return res.status(200).json(new ApiResponse(200, {}, "Dislike removed!!"));
  } else {
    // If user has not disliked the tweet, add a dislike
    const newDislike = new Like({
      tweet: tweetId,
      likedBy: req.user._id,
      likeType: "dislike",
    });
    await newDislike.save();
    return res.status(200).json(new ApiResponse(200, {}, "Tweet disliked!!"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // Find all liked videos by the user
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
    likeType: "like",
  })
    .populate("video")
    .select({
      _id: 0,
      video: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
      },
    });

  // Return the liked videos
  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos fetched successfully!!")
    );
});

export {
  toggleVideoLike,
  toggleVideoDislike,
  toggleCommentLike,
  toggleCommentDislike,
  toggleTweetLike,
  toggleTweetDislike,
  getLikedVideos,
};
