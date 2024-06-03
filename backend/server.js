import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));
dotenv.config();
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors())

const PORT = process.env.PORT || 4444
app.use(cookieParser())

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/notifications", notificationRoutes);


app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
	connectMongoDB()
})


