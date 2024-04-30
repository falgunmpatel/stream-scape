import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    //get the token from the request
    const token =
      req.cookies?.accessToken ||
      req.headers("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized Access");
    }

    //verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //check if the user exists
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //TODO: Frontend pe charcha baki hai
      throw new ApiError(401, "Invalid Access Token!!");
    }

    //set the user in the request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token!!");
  }
});
