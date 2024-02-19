import express from "express";
import {
	createUserWithGoogle,
	getMyProfile,
	addToWishList,
	updateProfile,
	verifiedUserWithNumber,
} from "../controllers/users.controllers.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express();

app.post("/new", createUserWithGoogle);
app.put("/verification", verifiedUserWithNumber);
app.get("/profile", getMyProfile);
app.put("/update", isAuthenticated, updateProfile);
app.put("/wishlist", addToWishList);

export default app;
