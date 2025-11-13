import { vi } from "vitest";
import { Request, Response, NextFunction } from "express";

// mock must come first
vi.mock("../utils/expressValidator.js", () => ({
  validateSignup: (req: Request, res: Response, next: NextFunction) => next(),
  validateLogin: (req: Request, res: Response, next: NextFunction) => next(),
}));

import request from "supertest";
import { beforeAll, afterAll, test, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

import usersRoute from "../routes/usersRoute.js";

const prisma = new PrismaClient();
let app: express.Express;

process.env.JWT_SECRET = "testsecret123";

beforeAll(async () => {
  app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/test", (req, res) => res.json({ message: "Hello, World!" }));
  app.use("/", usersRoute);

  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

// TEST: /test
test("GET /test returns Hello, World!", async () => {
  const res = await request(app).get("/test");
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Hello, World!");
});

// TEST: /signup
test("POST /signup creates a user", async () => {
  const res = await request(app).post("/signup").send({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    confirmPassword: "password123",
  });

  expect(res.status).toBe(200);
  expect(res.body.email).toBe("john@example.com");
  expect(res.body.token).toBeDefined();
});

// TEST: /login
test("POST /login logs in user", async () => {
  const res = await request(app).post("/login").send({
    email: "john@example.com",
    password: "password123",
  });

  expect(res.status).toBe(200);
  expect(res.body.email).toBe("john@example.com");
  expect(res.body.token).toBeDefined();
});

// TEST: /users
test("GET /users returns array of users", async () => {
  const res = await request(app).get("/users");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.users)).toBe(true);
  expect(res.body.users.length).toBeGreaterThan(0);
});

// TEST: /auto-login
test("POST /auto-login returns refreshed token", async () => {
  const login = await request(app).post("/login").send({
    email: "john@example.com",
    password: "password123",
  });

  const token = login.body.token;

  const res = await request(app)
    .post("/auto-login")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.email).toBe("john@example.com");
});
