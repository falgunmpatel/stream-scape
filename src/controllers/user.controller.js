import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //save the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access or refresh token!!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //check for avatar, cover image
  //upload them to cloudinary
  //create user object - save to db
  //check for user creation
  //remove password and refresh token field from the response
  //return the response

  //get the user details from the request body
  const { fullName, email, username, password } = req.body;

  //validate the user input
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    // TODO: More validations can be added for email format, password length, etc...Validation Files are usually created for this purpose in professional projects
    throw new ApiError(400, "All fields are required");
  }

  //Check if the user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  //get the avatar and cover image from public/temp folder created by multer
  //TODO: Explore req.files object - console.log(req.files) to see the structure
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload the avatar and cover image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create the user object
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User registration failed!! Please try again");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully!!"));
});

const loginUser = asyncHandler(async (req, res, next) => {
  //get the user details from the request body
  const { email, username, password } = req.body;

  //validate the user input
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }

  //check if the user exists
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //compare the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  //generate access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send cookie with token
  //TODO: Check is this query of finding user can be expensive or updating the user object is better
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //return the response
  res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully!!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  //remove the refresh token from the database
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { new: true }
  );

  //clear the cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully!!"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  //get the refresh token from the request
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request!!");
  }

  try {
    //verify the refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    //check if the user exists
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token!!");
    }

    //check if the refresh token is valid
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh Token Expired Or Used!!");
    }

    //generate a new access token
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    //return the response
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed Successfully!!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token!!");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
