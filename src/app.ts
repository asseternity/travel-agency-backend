// dependencies
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

// cors
app.use(
  cors({
    origin: ["https://asseternity.github.io", "http://localhost:5173"],
    credentials: true,
  })
);

// settings
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// test route
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ message: "Hello, World!" });
});

// mount routes
import usersRoute from "./routes/usersRoute.js";
app.use("/", usersRoute);

// launch
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});
