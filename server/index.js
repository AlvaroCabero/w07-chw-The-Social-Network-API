const express = require("express");
const chalk = require("chalk");
const morgan = require("morgan");
const debug = require("debug")("users:server");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes/userRoutes");
const { notFoundErrorHandler, errorHandler } = require("./middlewares/error");

const app = express();

app.use(cors());

const initializeServer = (port) =>
  new Promise((resolve) => {
    const server = app.listen(port, () => {
      debug(chalk.cyan(`Listening to port ${port}`));
      resolve(server);
    });

    server.on("error", (error) => {
      debug(chalk.red("Error to initialize Server"));
      if (error.code === "EADDRINUSE") {
        debug(chalk.red(`Port ${port} is already in use.`));
      }

      debug(chalk.red(error.code));
    });

    server.on("close", () => {
      debug(chalk.blue("See you soon"));
    });
  });

app.use(morgan("dev"));
app.use(express.json());

app.use("/users", userRoutes);

app.use(notFoundErrorHandler);
app.use(errorHandler);

module.exports = { initializeServer, app };
