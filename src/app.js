import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//cors setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//express setup
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));

//cookie-parser setup
app.use(cookieParser());

export { app };
