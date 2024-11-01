import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import cors from "cors";
import stripe from "stripe";
import Subscription from "./models/Subscription.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use(cors(
  {
    origin: "https://www.google.com",
    credentials: true,
  }
));

const stripeConfig = new stripe(process.env.STRIPE_SECRET_KEY);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

app.get("/", (req, res) => {
  res.send("Hiiiiii");
});

app.use("/api/auth", authRouter);

app.get("/api/subscribe", async (req, res) => {
  const plan = req.query.plan;
  let priceID;

  if (!plan) {
    return res.status(400).json({ message: "Please provide a plan" });
  }

  switch (plan.toLowerCase()) {
    case "yearly":
      priceID = "price_1QGCJJCFRuzc2dpCmzgd8nYL";
      break;
    case "monthly":
      priceID = "price_1QGCIuCFRuzc2dpC3o0DdX0S";
      break;

    default:
      return res.status(400).json({ message: "Invalid plan" });
  }

  const session = await stripeConfig.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceID,
        quantity: 1,
      },
    ],

    // CHANGE THE URL
    // success_url: `http://localhost:3000/success?plan=${plan}`,
    // cancel_url: "http://localhost:3000/cancel",

    success_url: `https://talkative-iota.vercel.app/success?plan=${plan}`,
    cancel_url: "https://talkative-iota.vercel.app/cancel",
  });

  res.redirect(session.url);
});

app.post("/api/subscription", async (req, res) => {
  //Create new Subscription
  try {
    const { userEmail, plan, expire } = req.body;

    if (!userEmail || !plan || !expire) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    await Subscription.create({
      userEmail,
      plan,
      expire,
    });
  } catch (error) {
    console.log("ERROR: " + error);
  }
});

app.get("/api/subscriptions", async (req, res) => {
  console.log(req.query.email);
  Subscription.findOne({ userEmail: req.query.email }).then((subscription) => {
    res.json(subscription);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
