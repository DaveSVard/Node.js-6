const express = require("express");
const auth = express.Router();
const db = require("../models");
const Jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");
require("dotenv").config();

auth.post("/register", async (req, res) => {
  const { name, login, password } = req.body;

  if (!name.trim() || !login.trim() || !password.trim()) {
    return res.status(400).send({ error: "Please fill all fields" });
  }

  if (password.length < 6) {
    return res.status(400).send({ error: "Password is too weak" });
  }

  const found = await db.Users.findOne({ value: { login } });

  if (found) {
    return res.status(400).send({ error: "Login is busy" });
  }

  const user = new db.Users({
    name,
    login,
    password: await bcrypt.hash(password, 10),
  });

  await user.save();
  res.status(201).send({ message: "Success" });
});

auth.post("/login", async (req, res) => {
  const { login, password } = req.body;

  if (!login.trim() || !password.trim()) {
    return res.status(400).send({ error: "Please fill all fields" });
  }

  const found = await db.Users.findOne({ where: { login } });
  if (!found) {
    return res.status(400).send({ error: "Wrong credentials!" });
  }

  const match = await bcrypt.compare(password, found.password);
  if (!match) {
    const [attempt, created] = await db.Attempts.findOrCreate({
      where: { userId: found.id },
      defaults: {
        attempt: 1,
        time: Date.now(),
      },
    });

    if (!created) {
      attempt.attempt += 1;
      attempt.time = Date.now();
      await attempt.save();
    }

    return res.status(400).send({ error: "Wrong credentials!" });
  }

  const userAttempts = await db.Attempts.findOne({
    where: { userId: found.id },
  });

  const blockTime = 3 * 60 * 1000;

  if (userAttempts) {
    const tooManyAttempts =
      userAttempts.attempt >= 3 && Date.now() - userAttempts.time < blockTime;

    if (tooManyAttempts) {
      const minutesLeft = Math.ceil(
        (blockTime - (Date.now() - userAttempts.time)) / 60000
      );

      return res.status(400).send({
        error: `Account blocked. Try again in ${minutesLeft} minutes.`,
      });
    }
  }

  await db.Attempts.destroy({ where: { userId: found.id } });

  const token = Jwt.sign(
    { id: found.id, name: found.name },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );

  res.send({ token });
});

auth.get("/profile", authMiddleware, async (req, res) => {
  return res.send({ user: req.user });
});

module.exports = auth;
