import { asyncHandler } from "../utils/asynHandler.js";

const registerUser = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: "ok",
  });
});

export { registerUser };
