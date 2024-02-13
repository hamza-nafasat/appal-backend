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
app.put("/verification", isAuthenticated, verifiedUserWithNumber);
app.get("/profile", isAuthenticated, getMyProfile);
app.put("/update", isAuthenticated, updateProfile);
app.put("/wishlist", isAuthenticated, addToWishList);

export default app;
