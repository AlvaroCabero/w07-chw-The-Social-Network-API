require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../database/models/user");
const { userLogin, userSignUp } = require("./userControllers");

jest.mock("../../database/models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Given an userLogin function", () => {
  describe("When it receives a request with a wrong username", () => {
    test("Then it should invoke the next function with a 401 error", async () => {
      const username = "consolog";

      const req = {
        body: {
          username,
        },
      };

      const res = {};

      User.findOne = jest.fn().mockResolvedValue(false);

      const expectedError = new Error("Wrong credentials");
      expectedError.code = 401;
      const next = jest.fn();

      await userLogin(req, res, next);

      expect(User.findOne).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expectedError);
      expect(next.mock.calls[0][0]).toHaveProperty(
        "message",
        expectedError.message
      );
      expect(next.mock.calls[0][0]).toHaveProperty("code", expectedError.code);
    });
  });

  describe("When it receives a right username but the wrong password", () => {
    test("Then it should invoke next function with 401 error", async () => {
      const user = {
        username: "abram",
        password: "abram",
      };

      User.findOne = jest.fn().mockResolvedValue(user);

      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const req = {
        body: {
          username: "abram",
          password: "myfriend",
        },
      };

      const expectedError = new Error("Wrong credentialss");
      expectedError.code = 401;

      const next = jest.fn();

      await userLogin(req, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);

      expect(next.mock.calls[0][0]).toHaveProperty(
        "message",
        expectedError.message
      );

      expect(next.mock.calls[0][0]).toHaveProperty("code", expectedError.code);
    });
  });
});
