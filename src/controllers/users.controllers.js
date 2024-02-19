import User from "../models/user.model.js";
import CustomError from "../utils/customClass.js";
import { TryCatch } from "../middlewares/errorHandler.js";
import { responseFunc } from "../utils/features.js";

// ======================================
// http://localhost:8000/api/v1/users/new = CREATE OR LOGIN USER WITH GOOGLE
// ======================================

export const createUserWithGoogle = TryCatch(async (req, res, next) => {
	const { name, email, photo, _id } = req.body;
	// //if user already exist then just logged in the user
	let user = await User.findById(_id);
	if (user) return responseFunc(res, `Welcome sir ${user.name}`, 200);
	//// if user not exist then first create the user and logged in
	if (!name || !email || !photo || !_id) {
		return next(new CustomError("Please Enter All Fields", 400));
	}
	user = await User.findOne({ email });
	if (user) return responseFunc(res, `Please Enter A Unique Email`, 400);
	user = await User.create({ name, email, photo, _id, isVerified: false });
	responseFunc(res, "Account Registered Successfully", 201);
});

// ===============================================
// http://localhost:8000/api/v1/users/verification = Verified Account
// ===============================================

export const verifiedUserWithNumber = TryCatch(async (req, res, next) => {
	const { number } = req.body;
	if (!number) {
		return next(new CustomError("Please Provide Number Again", 400));
	}
	let user = await User.findById(req.query._id);
	user.number = number;
	user.isVerified = true;
	await user.save();
	responseFunc(res, "Account Verified Successfully", 201);
});

// ==========================================
// http://localhost:8000/api/v1/users/profile = Get My Profile
// ==========================================

export const getMyProfile = TryCatch(async (req, res, next) => {
	const { _id } = req.query;
	let user = await User.findById(_id);
	console.log(user);
	responseFunc(res, "", 200, user);
});

// ==========================================
// http://localhost:8000/api/v1/users/update-profile = Update Profile
// ==========================================

export const updateProfile = TryCatch(async (req, res, next) => {
	const { name, dob } = req.body;
	if (!name && !dob) {
		return next(new CustomError("Please Enter What You Want To Change", 400));
	}
	const user = await User.findById(req.query._id);
	if (name) user.name = name;
	if (dob) user.dob = new Date(dob);
	await user.save();
	responseFunc(res, "Updated Successfully", 200);
});

//==============================================
// http://localhost:8000/api/v1/products/wishList =  ADD TO WISHLIST
// =============================================

export const addToWishList = TryCatch(async (req, res, next) => {
	const { productId } = req.body;
	if (!productId) {
		return next(new CustomError("Please Enter Product Id", 400));
	}
	const user = await User.findById(req.query._id);
	console.log(user.wishList);
	let isProductExist = false;
	if (productId) {
		user.wishList.forEach((item) => {
			if (item == productId) {
				return next(new CustomError("Product Already Added", 400));
			}
		});
		user.wishList.push(productId);
	}
	await user.save();
	responseFunc(res, "Added To WishList", 200);
});
