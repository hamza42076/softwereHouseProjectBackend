import express from "express";
import registerRouter from "./Routes/auth.js";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config"
const app = express();

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
    res.send("Hello from Express server!");
});
app.use("/auth", registerRouter);
mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.listen(process.env.PORT, () => {
    console.log("Server is running on port 3000");
});
