import express from "express";
import {
	bidOnProduct,
	createNewProduct,
	deleteProduct,
	deleteYourBid,
	getCityNames,
	getFullProducts,
	getSingleProduct,
	latestProduct,
	latestProduct2,
	mainSearchApi,
	myProducts,
	myWishLists,
	updateProduct,
} from "../controllers/products.controllers.js";
import { multiUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express();
// get latest product
app.get("/latest", latestProduct);
// create new product
app.post("/create", multiUpload, createNewProduct);
// get all product
app.get("/all", getFullProducts);
// get all cities
app.get("/cities", getCityNames);
// get all my products
app.get("/my-products", myProducts);
// bid on product
app.route("/bids/:_id").put(bidOnProduct).delete(isAuthenticated, deleteYourBid);
// get single product update and delete
app.get("/search-products", mainSearchApi);
app.post("/wishlist", myWishLists);
// get single product update and delete
app.route("/:_id").get(getSingleProduct).put(multiUpload, updateProduct).delete(deleteProduct);

app.post("/fake", latestProduct2);

export default app;
