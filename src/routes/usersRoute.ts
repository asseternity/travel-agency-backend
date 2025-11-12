import express from "express";
import { validateSignup, validateLogin } from "../utils/expressValidator";
import usersController from "../controllers/usersController";

const usersRoute = express.Router();

usersRoute.get("/users", usersController.getAllUsers);
usersRoute.post("/signup", validateSignup, usersController.postSignUp);
usersRoute.post("/login", validateLogin, usersController.postManualLogin);
usersRoute.post("/auto-login", usersController.postAutoLogin);

export default usersRoute;
