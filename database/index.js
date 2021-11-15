const debug = require("debug")("users:database");
const chalk = require("chalk");
const mongoose = require("mongoose");

const connectDB = (connectionString) =>
  new Promise((resolve, reject) => {
    mongoose.set("toJSON", {
      virtuals: true,
      transform: (doc, ret) => {
        // eslint-disable-next-line no-underscore-dangle
        delete ret._id;
        // eslint-disable-next-line no-underscore-dangle
        delete ret.__v;
      },
    });

    mongoose.connect(connectionString, (error) => {
      if (error) {
        debug(chalk.red("Error connecting to DataBase"));
        debug(chalk.red(error.message));
        reject(error);
      }
      debug(chalk.green("Successfully connected to DataBase "));
      resolve();
    });

    mongoose.connection.on("close", () => {
      debug(chalk.green("Closed connection to Database"));
    });
  });

module.exports = connectDB;
