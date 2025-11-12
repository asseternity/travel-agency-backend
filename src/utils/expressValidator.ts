import { body } from "express-validator";

export const validateSignup = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 10 })
    .matches(/^[A-Za-z]+$/)
    .withMessage("First name must be alphabetic, 2–10 letters."),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 10 })
    .matches(/^[A-Za-z]+$/)
    .withMessage("Last name must be alphabetic, 2–10 letters."),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/)
    .withMessage("Password must have at least 1 number and 1 symbol."),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) throw new Error("Passwords do not match");
    return true;
  }),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists({ checkFalsy: true }).isString().trim(),
];
