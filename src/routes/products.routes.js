import express from "express";
import {
	bidOnProduct,
	createNewProduct,
	deleteProduct,
	deleteYourBid,
	getCityNames,
	getFullProducts,
	getSingleProduct,
	mainSearchApi,
	myProducts,
	updateProduct,
} from "../controllers/products.controllers.js";
import { multiUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express();

// create new product
app.post("/create", isAuthenticated, multiUpload, createNewProduct);
// get all product
app.get("/all", getFullProducts);
// get all cities
app.get("/cities", getCityNames);
// get all my products
app.get("/my-products", isAuthenticated, myProducts);
// bid on product
app.route("/bids/:_id").put(isAuthenticated, bidOnProduct).delete(isAuthenticated, deleteYourBid);
// get single product update and delete
app.get("/search-products", mainSearchApi);
// get single product update and delete
app.route("/:_id")
	.get(getSingleProduct)
	.put(isAuthenticated, multiUpload, updateProduct)
	.delete(isAuthenticated, deleteProduct);

export default app;
