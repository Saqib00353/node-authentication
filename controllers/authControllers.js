const User = require("../models/User");
const jwt = require("jsonwebtoken");

function handlErrors(error) {
  let errors = { email: "", password: "" };

  if (error.message === "Incorrect Email") {
    errors.email = "Entered Email is Incorrect!";
  }

  if (error.message === "Incorrect Password") {
    errors.password = "Password is Incorrect!";
  }

  if (error.code === 11000) {
    errors.email = "Email Already Exists!";
    return errors;
  }

  if (error.message.includes("users validation failed")) {
    Object.values(error.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

const maxAge = 3 * 24 * 60 * 60;

function createToken(id) {
  return jwt.sign({ id }, "saqib secret", {
    expiresIn: maxAge,
  });
}

exports.signup_get = (req, res) => {
  res.render("signup");
};

exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (error) {
    const errors = handlErrors(error);
    res.status(400).json({ errors });
  }
};

exports.login_get = (req, res) => {
  res.render("login");
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (error) {
    const errors = handlErrors(error);
    res.status(400).json({ errors });
  }
};

exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
