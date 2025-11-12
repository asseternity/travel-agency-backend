import request from "supertest";
import { beforeAll, afterAll, test, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";

const prisma = new PrismaClient();
let app: express.Express;

beforeAll(async () => {
  app = express();
  app.use(cors());
  app.get("/test", (req, res) => res.json({ message: "World" }));
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("GET /test returns World", async () => {
  const res = await request(app).get("/test");
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Hello, World!");
});
