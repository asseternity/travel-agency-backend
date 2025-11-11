// dependencies
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "node:path";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const app = express();

// cors
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// test route
app.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({ message: "World" });
});

// launch
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listening on port ${port}!`);
});
