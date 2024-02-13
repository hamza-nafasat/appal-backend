import fs from "fs";
import mongoose from "mongoose";
import { Mongoose } from "mongoose";

// =====================
// delete photo function
// =====================
export const deletePhoto = (path) => {
	fs.unlink(path, (err) => {
		if (err) console.log("Error deleting image", err.message);
		console.log("Image deleted Successfully");
	});
};
// ================================
// connectDB for connecting mongodb
// ================================
export const connectDB = async (uri, dbName) => {
	try {
		const response = await mongoose.connect(uri, {
			dbName,
		});

		const { name, host, port } = response.connection;
		console.log(`DB ${name} is connected on mongodb://${host}:${port}`);
	} catch (err) {
		console.log(err);
		console.log(`MongoDB connection failed ${err}`);
	}
};
// ===========================================
// send custom response function for every api
// ===========================================
export const responseFunc = (res, message, statusCode, data) => {
	const response = { success: true };
	if (message) response.message = message;
	if (data) response.data = data;
	res.status(statusCode || 200).json(response);
};
