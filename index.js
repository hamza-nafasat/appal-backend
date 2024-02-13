import morgan from "morgan";
import express from "express";
import { config } from "dotenv";
import { connectDB } from "./src/utils/features.js";
import usersRoutes from "./src/routes/users.routes.js";
import productsRoutes from "./src/routes/products.routes.js";
import { customErrorMiddleWare } from "./src/middlewares/errorHandler.js";
import cors from "cors";

config({});

// Constant Variables ...........
const app = express();
const port = process.env.PORT || 8000;
const mongoUrl = process.env.MONGODB_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "appal-database2";
const usersPrefix = "/api/v1/users";
const productsPrefix = "/api/v1/products";
// Other Middlewares ...........
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5173"], credentials: true }));
app.use(express.json());
app.use(morgan("dev"));
// Adding Routes ...........
app.use(usersPrefix, usersRoutes);
app.use(productsPrefix, productsRoutes);
app.get("/", (req, res) => {
	res.send(`App is running on <a href={"http://localhost:5173"}>Frontend url</a>`);
});
// Static Folder for Pics ...........
app.use("/uploads", express.static("uploads"));
// Error Handler Middleware ...........
app.use(customErrorMiddleWare);
// CONNECTING MONGODB ASYNCHRONOUSLY
// =================================
(async () => {
	try {
		await connectDB(mongoUrl, dbName);
		//// Server id Listing if database successfully connected
		app.listen(port, () => console.log(`app listening on ${port}`));
	} catch (err) {
		console.error(`Failed to start server ${err}`);
		// process.exit(1);
	}
})();
