import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch comments
  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
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
        content: 1,
        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
          fullName: 1,
          email: 1,
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, { comments }, "Comments fetched successfully!!")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  // check videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // check comment content
  if (content.trim() === "") {
    throw new ApiError(400, "Comment content cannot be empty!!");
  }

  // create comment
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { comment }, "Comment added successfully!!"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // check commentId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // check comment content
  if (content.trim() === "") {
    // nothing to update
    res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "Comment not updated!! Comment Content Empty!!"
        )
      );
    return;
  }

  // update comment
  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: content,
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully!!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // check commentId
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // delete comment
  await Comment.findByIdAndDelete(commentId);

  //return response
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully!!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
