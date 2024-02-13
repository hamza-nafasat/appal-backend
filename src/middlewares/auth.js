import User from "../models/user.model.js";
import CustomError from "../utils/customClass.js";
import { TryCatch } from "./errorHandler.js";

export const isAuthenticated = TryCatch(async (req, res, next) => {
	const { _id } = req.query;
	if (!_id) return next(new CustomError("Please Login First", 401));
	const user = await User.findById(_id);
	if (!user) return next(new CustomError("Please Sign up First", 401));
	req.user = user;
	next();
});
