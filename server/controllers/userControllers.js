require("dotenv").config();
const debug = require("debug")("users:controller");
const bcrypt = require("bcrypt");
const chalk = require("chalk");
const jwt = require("jsonwebtoken");
const User = require("../../database/models/user");

const userLogin = async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    debug(chalk.red("Wrong credentials"));
    const error = new Error("Wrong credentials");
    error.code = 401;
    next(error);
  } else {
    const rightPassword = await bcrypt.compare(password, user.password);
    if (!rightPassword) {
      debug(chalk.red("Wrong credentialss"));
      const error = new Error("Wrong credentialss");
      error.code = 401;
      next(error);
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.SECRET,
        {
          expiresIn: 48 * 60 * 60,
        }
      );
      res.json({ token });
    }
  }
};

const userSignUp = async (req, res, next) => {
  const newUser = req.body;
  const user = await User.findOne({ username: newUser.username });
  if (user) {
    debug(chalk.red("Username already exist"));
    const error = new Error("Username already exists");
    error.code = 400;
    next(error);
  } else {
    newUser.friends = [];
    newUser.enemies = [];
    newUser.photo = newUser.photo ? newUser.photo : "";
    newUser.bio = newUser.bio ? newUser.bio : "";
    newUser.password = await bcrypt.hash(newUser.password, 10);
    await User.create(newUser);
    res.json(newUser);
  }
};

module.exports = { userLogin, userSignUp };
