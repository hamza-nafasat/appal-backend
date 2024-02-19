import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
	{
		minPrice: {
			type: Number,
			required: true,
		},
		maxPrice: {
			type: Number,
			required: true,
		},
		photos: [],
		category: {
			type: String,
			trim: true,
			required: true,
		},
		model: {
			type: String,
			trim: true,
			required: true,
		},
		condition: {
			type: String,
			required: true,
			enum: ["new", "refurbished", "used"],
		},
		description: {
			type: String,
			required: true,
		},
		address: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		ownerId: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ["available", "sold", "Paused"],
		},
		bids: [
			{
				userId: {
					type: String,
					ref: "User",
					required: true,
				},
				price: {
					type: Number,
					required: true,
				},
				description: {
					type: String,
				},
				createdAt: Date,
			},
		],
	},
	{ timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
export default Product;
