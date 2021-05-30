const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../models/users.model");

const signup = async (req, res) => {
    const { name, email, password, accountAddress, secretKey } = req.body;

  if (!name || !email || !password || !accountAddress || !secretKey) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await User.find({ email })
    .then(async (user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }

      await bcrypt.hash(password, 10).then(async (hash) => {
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(),
          name,
          email,
          password: hash,
          accountAddress,
          secretKey,
        });

        await newUser
          .save()
          .then((result) => {
            const token = jwt.sign(
              {
                userId: result._id,
                email: result.email,
                name: result.name,
                accountAddress: result.accountAddress,
                secretKey: result.secretKey,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );

            res.status(201).json({
              message: "Signup successful",
              userDetails: {
                _id: result._id,
                name: result.name,
                email: result.email,
                accountAddress: result.accountAddress,
                secretKey: result.secretKey,
              },
              token,
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Something went wrong",
              error: err.toString(),
            });
          });
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "1 or more parameter(s) missing from req.body",
    });
  }

  await User.find({ email })
    .then(async (user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }

      await bcrypt
        .compare(password, user[0].password)
        .then((result) => {
          if (result) {
            const token = jwt.sign(
              {
                userId: user[0]._id,
                email: user[0].email,
                name: user[0].name,
                accountAddress: user[0].accountAddress,
                secretKey: user[0].secretKey,
              },
              process.env.JWT_SECRET,
              {
                expiresIn: "30d",
              }
            );
            return res.status(200).json({
              userDetails: {
                _id: user[0]._id,
                name: user[0].name,
                email: user[0].email,
                accountAddress: user[0].accountAddress,
                secretKey: user[0].secretKey,
              },
              token,
            });
          }
          return res.status(401).json({
            message: "Auth failed",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "Something went wrong",
            error: err.toString(),
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Something went wrong",
        error: err.toString(),
      });
    });
};

module.exports = {
  signup,
  login,
};
