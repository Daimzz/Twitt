import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js";
import connectMongoDB from "./db/connectMongoDB.js";

const app = express();
dotenv.config();
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT || 4444

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	connectMongoDB()
})


