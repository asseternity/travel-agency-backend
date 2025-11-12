import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// middleware
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
};

const postSignUp = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send(`Passwords don't match`);
    }
    const existing = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (existing) return res.status(400).send("Email already exists");

    const email = req.body.email;
    const fullName = req.body.firstName + " " + req.body.lastName;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        full_name: fullName,
        password: hashedPassword,
      },
    });
    const payload = { email: user.email, id: user.id };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const options: SignOptions = { expiresIn: "7d" };
    const token = jwt.sign(payload, secret, options);
    return res
      .status(200)
      .json({ email: user.email, fullName: user.full_name, token });
  } catch (err) {
    return next(err);
  }
};

const postManualLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    if (!user) {
      return res.status(400).send(`Incorrect email or password`);
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).send(`Incorrect email or password`);
    }

    const payload = { email: user.email, id: user.id };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const options: SignOptions = { expiresIn: "7d" };
    const token = jwt.sign(payload, secret, options);
    return res
      .status(200)
      .json({ email: user.email, fullName: user.full_name, token });
  } catch (err) {
    return next(err);
  }
};

const postAutoLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Missing token");
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined");
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).send("User not found");
    const newToken = jwt.sign({ id: user.id }, secret, { expiresIn: "7d" });
    return res
      .status(200)
      .json({ email: user.email, fullName: user.full_name, token: newToken });
  } catch {
    res.status(401).send("Invalid token.");
  }
};

export default {
  getAllUsers,
  postSignUp,
  postManualLogin,
  postAutoLogin,
};
