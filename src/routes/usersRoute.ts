import express from "express";
import { validateSignup, validateLogin } from "../utils/expressValidator.js";
import usersController from "../controllers/usersController.js";

const usersRoute = express.Router();

usersRoute.get("/users", usersController.getAllUsers);
usersRoute.post("/signup", validateSignup, usersController.postSignUp);
usersRoute.post("/login", validateLogin, usersController.postManualLogin);
usersRoute.post("/auto-login", usersController.postAutoLogin);

export default usersRoute;
