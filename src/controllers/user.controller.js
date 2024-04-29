import { asyncHandler } from "../utils/asynHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res, next) => {
  //check for avatar, cover image
  //upload them to cloudinary
  //create user object - save to db
  //check for user creation
  //remove password and refresh token field from the response
  //return the response

  //get the user details from the request body
  const { fullName, email, username, password } = req.body;
  console.log(`email: ${email}`);

  //validate the user input
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    // TODO: More validations can be added for email format, password length, etc...Validation Files are usually created for this purpose in professional projects
    throw new ApiError(400, "All fields are required");
  }

  //Check if the user already exists
  const existingUser = User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with username or email already exists");
  }

  //get the avatar and cover image from public/temp folder created by multer
  //TODO: Explore req.files object
  console.log("User Controller :: RegisterUser ", req.files);
  const avatarLocalPath = req.files?.avatar[0].path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

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

  const createdUser = User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User registration failed!! Please try again");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully!!"));
});

export { registerUser };
