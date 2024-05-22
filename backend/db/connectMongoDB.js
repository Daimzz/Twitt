import mongoose from "mongoose";
 async function connectMongoDB() {
	try {
		const dbConnection = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB connected: ${dbConnection.connection.host}`);

	} catch (e) {
		console.error(`Error: ${e.message}`);
		process.exit(1);
	}
}
export default connectMongoDB