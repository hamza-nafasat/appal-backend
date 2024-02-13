import morgan from "morgan";
import express from "express";
import { config } from "dotenv";
import NodeCache from "node-cache";
import { connectDB } from "./utils/features.js";
import usersRoutes from "./routes/users.routes.js";
// import orderRoutes from "./routes/orders.routes.js";
import productsRoutes from "./routes/products.routes.js";
import { customErrorMiddleWare } from "./middlewares/errorHandler.js";
config({
	path: "./.env",
});
// Constant Variables ...........
const app = express();
const port = process.env.PORT || 8000;
const mongoUrl = process.env.MONGODB_URL || "";
const dbName = process.env.DB_NAME || "appal-database";
const usersPrefix = "/api/v1/users";
const productsPrefix = "/api/v1/products";
// const orderPrefix = "/api/v1/orders";
// Node Cashing ...........
export const nodeCash = new NodeCache();
// Other Middlewares ...........
app.use(express.json());
app.use(morgan("dev"));
// Adding Routes ...........
app.use(usersPrefix, usersRoutes);
app.use(productsPrefix, productsRoutes);
// app.use(orderPrefix, orderRoutes);
app.get("/", (req, res) => {
	res.send(`App is running on <a href={${process.env.FRONTEND_ULR}}>Frontend url</a>`);
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
		console.error(`Failed to start server ${err.message}`);
		process.exit(1);
	}
})();
