require("dotenv").config();
const debug = require("debug")("users:routes:tests");
const chalk = require("chalk");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const supertest = require("supertest");
const connectDB = require("../../../database");
const User = require("../../../database/models/user");
const { initializeServer, app } = require("../../index");

jest.setTimeout(40000);

const request = supertest(app);

let server;
let testToken;
// let passwords;

beforeAll(async () => {
  await connectDB(process.env.MONGODB_STRING_TEST);
  server = await initializeServer(process.env.SERVER_PORT_TEST);
});

beforeEach(async () => {
  const testUsers = [
    {
      name: "alf",
      password: await bcrypt.hash("melmac", 10),
      username: "alf",
      photo: "",
      bio: "",
      _id: "61912e4305d0a11ffbb4ea56",
    },
    {
      name: "et",
      password: await bcrypt.hash("micasa", 10),
      username: "et",
      photo: "",
      bio: "",
      _id: "61915e41d36c68d94a084a90",
    },
  ];

  // passwords = [testUsers[0].password, testUsers[1].password];

  await User.deleteMany();
  await User.create(testUsers[0]);
  await User.create(testUsers[1]);

  const { body } = await request
    .post("/users/login")
    .send({ username: "alf", password: "melmac" })
    .expect(200);

  testToken = body.token;
});

afterAll(async () => {
  await mongoose.connection.on("close", () => {
    debug(chalk.red("Closed connection to Database"));
  });
  await mongoose.connection.close();
  await server.on("close", () => {
    debug(chalk.red("Closed server"));
  });
  await server.close();
});

describe("Given a /users router,", () => {
  describe("When it gets a POST request for /users/login with a non existing username", () => {
    test("Then it should send a response with an error and a status code of 401", async () => {
      const { body } = await request
        .post("/users/login")
        .send({ username: "niconsole", password: "niconsolo" })
        .expect(401);

      const expectedError = {
        error: "Wrong credentials",
      };

      expect(body.token).not.toBeDefined();
      expect(body).toEqual(expectedError);
    });
  });

  describe("When it gets a POST request for /users/login with an existing username and a password", () => {
    test("Then it should send a response with a token and a status code of 200", async () => {
      const { body } = await request
        .post("/users/login")
        .send({ username: "alf", password: "melmac" })
        .expect(200);

      expect(body.token).toBeDefined();
    });
  });

  describe("When it gets a POST request for /users/signup without all the required fields", () => {
    test("Then it should send a response with an error and a status code of 400", async () => {
      const { body } = await request
        .post("/users/singup")
        .send({ username: "niconsole" })
        .expect(404);

      const expectedError = {
        error: "Sent wrong format of request",
      };

      expect(body).toEqual(expectedError);
    });
  });

  describe("When it gets a POST request for a non existing route", () => {
    test("Then it should send an error and a status code of 404", async () => {
      const { body } = await request
        .post("/users/badroute")
        .send({
          name: "Yoda",
          username: "yoda",
          password: "bewater",
        })
        .expect(404);

      const expectedError = {
        error: "Endpoint not found",
      };

      expect(body).toEqual(expectedError);
    });
  });

  describe("When it gets a POST request for /users/signup with all the required fields", () => {
    test("Then it should send a response with the new user and a status code of 200", async () => {
      const { body } = await request
        .post("/users/signup")
        .send({
          name: "Yoda",
          username: "yoda",
          password: "bewater",
        })
        .expect(200);

      expect(body).toHaveProperty("name", "Yoda");
    });
  });

  describe("When it gets a POST request for /users/singup with an existing username", () => {
    test("Then it should send an error and a status code of 404", async () => {
      const { body } = await request
        .post("/users/singup")
        .send({ name: "alf", username: "alf", password: "joe" })
        .expect(404);

      const expectedError = {
        error: "Username already exists",
      };

      expect(body).toEqual(expectedError);
    });
  });
});
