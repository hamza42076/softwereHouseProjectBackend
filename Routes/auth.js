import express from "express";
import "dotenv/config";
import User from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerRouter = express.Router();

registerRouter.post("/register", async (req, res) => {
  try {
    let { fullname, email, password, confirmPassword } = req.body;
    console.log({ fullname, email, password });

    // 1. All fields
    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // 2. Password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }

    // 3. Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // 4. Duplicate email
    const duplicate = await User.findOne({ email });
    if (duplicate) {
      return res.status(409).json({ msg: "Duplicate email" });
    }

    // 5. Hash password
    const saltRounds = Number(process.env.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 6. Create user
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });
    const newData = await newUser.save();

    let createdToken = jwt.sign(
      {
        id: newData._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 7. Response
    res.status(201).json({
      message: "User registered successfully",
      data: newData,
      token: createdToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

registerRouter.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log({ email, password });
    // Implement login logic here
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }
    // Token generation
    let createdToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).send({
      message: "Login successful",
      data: user,
      token: createdToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
registerRouter.get("/me", async (req, res) => {
  // Placeholder for user profile retrieval
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ msg: "Invalid token" });
    }
    console.log("decoded token:", decoded);
    let getUser =await User.findById(decoded.id).select("-password");
    if (!getUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User get succesfully", data: getUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default registerRouter;
