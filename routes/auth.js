
import express from "express";
import User from "../models/User.js"
const router = express.Router();

// Registration Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, image, provider } = req.body;
    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      await User.create({
        name,
        email,
        image,
        provider,
      });

      res
      .status(201)
      .json({ message: "User registered successfully"});
    }
    else {
      res.status(200).json({ message: "User already exists" });
    //   req.redirect("/")
    }

   
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

export default router;
