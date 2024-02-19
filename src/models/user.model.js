import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		photo: {
			type: String,
			required: true,
		},
		number: {
			type: String,
		},
		isVerified: {
			type: Boolean,
		},
		dob: {
			type: Date,
		},
		wishList: [],
	},
	{ timestamps: true }
);

// Hash the password before saving it to the database
// ==================================================
userSchema.pre("save", async function (next) {
	try {
		if (!this.isModified("password")) return next();
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		console.error("Error during password hashing:", error.message);
		next(error);
	}
});

// Method to compare passwords
// ===========================
userSchema.methods.comparePassword = async function (enteredPassword) {
	try {
		return await bcrypt.compare(enteredPassword, this.password);
	} catch (error) {
		console.error("Error during password comparison:", error.message);
	}
};

const User = mongoose.model("User", userSchema);

export default User;
