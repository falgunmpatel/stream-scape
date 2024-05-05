import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
  toggleVideoDislike,
  toggleCommentDislike,
  toggleTweetDislike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle-like/v/:videoId").post(toggleVideoLike);
router.route("/toggle-like/c/:commentId").post(toggleCommentLike);
router.route("/toggle-like/t/:tweetId").post(toggleTweetLike);
router.route("/toggle-dislike/v/:videoId").post(toggleVideoDislike);
router.route("/toggle-dislike/c/:commentId").post(toggleCommentDislike);
router.route("/toggle-dislike/t/:tweetId").post(toggleTweetDislike);
router.route("/videos").get(getLikedVideos);

export default router;
