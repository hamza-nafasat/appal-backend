import { TryCatch } from "../middlewares/errorHandler.js";
import Product from "../models/products.model.js";
import CustomError from "../utils/customClass.js";
import { deletePhoto, responseFunc } from "../utils/features.js";

// ============================================
// http://localhost:8000/api/v1/products/create = CREATE NEW PRODUCT
// ============================================
export const createNewProduct = TryCatch(async (req, res, next) => {
	const { minPrice, maxPrice, model, category, condition, description, address, city, status } =
		req.body;
	const { photos } = req.files;
	if (!photos) return next(new CustomError("Please Enter AtLeast One Photo", 400));
	//// if any field doesn't exist then delete photo and return an err response
	if (
		!minPrice ||
		!maxPrice ||
		!model ||
		!category ||
		!condition ||
		!description ||
		!address ||
		!city ||
		!status
	) {
		//// if not all fields the delete all photo array from saved folder
		photos.forEach((photo) => deletePhoto(photo));
		return next(new CustomError("Please Enter All Required Fields", 400));
	}
	//// pics array urls
	let photosArrUrls = photos.map((photo) => photo.path);
	//// if all fields exist and product does'nt exist then create a new product
	await Product.create({
		minPrice: Number(minPrice),
		maxPrice: Number(maxPrice),
		category: category.toLowerCase(),
		model: model.toLowerCase(),
		condition: condition,
		description: description,
		address: address,
		city: city,
		photos: photosArrUrls,
		status: status,
		ownerId: req.user._id,
	});
	//// sending response
	return responseFunc(res, "Product Created Successfully", 201);
});

// =========================================
// http://localhost:8000/api/v1/products/all =  ALL PRODUCTS
// =========================================
export const getFullProducts = TryCatch(async (req, res, next) => {
	const products = await Product.find();
	return responseFunc(res, "Products Received successfully", 200, products);
});

// ================================================
// http://localhost:8000/api/v1/products/locations  =  CITES
// ================================================
export const getCityNames = TryCatch(async (req, res, next) => {
	const cities = await Product.distinct("city");
	return responseFunc(res, "Cities Received", 200, cities);
});

// ====================================================
// http://localhost:8000/api/v1/products/my-products = My Products
// ====================================================
export const myProducts = TryCatch(async (req, res, next) => {
	let myId = req.user._id;
	let products = await Product.find({ ownerId: myId });
	return responseFunc(res, "All Adds Received", 200, products);
});

// =========================================
// http://localhost:8000/api/v1/products/_id =  GET SINGLE PRODUCT
// ==========================================
export const getSingleProduct = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	const product = await Product.findById(_id);
	if (!product) return next(new CustomError("Product Not Found", 404));
	return responseFunc(res, "Product Received Successfully", 200, product);
});
// =========== same route =========== = DELETE SINGLE PRODUCT
export const deleteProduct = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	const product = await Product.findByIdAndDelete({ _id });
	if (!product) return next(new CustomError("Product Not Found", 404));
	//// deleting image from uploads folder
	product.photos.forEach((photo) => deletePhoto(photo));
	return responseFunc(res, "Product Deleted Successfully", 200);
});
// =========== same route =========== = UPDATE SINGLE PRODUCT
export const updateProduct = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	let product = await Product.findById(_id);
	if (!product) return next(new CustomError("Product Not Found", 404));
	//// if product is available in database then go next
	const photos = req.files.photos;
	const { minPrice, maxPrice, model, category, condition, description, address, city, status } =
		req.body;
	//// if not provided anything
	if (
		!status &&
		!condition &&
		!address &&
		!category &&
		!model &&
		!photos &&
		!minPrice &&
		!maxPrice &&
		!city &&
		!description
	) {
		return next(new CustomError("Please Update Something First", 400));
	}
	if (photos) {
		product.photos.forEach((photo) => deletePhoto(photo));
		product.photos = photos.map((photo) => photo.path);
	}
	if (minPrice) product.minPrice = minPrice;
	if (maxPrice) product.maxPrice = maxPrice;
	if (model) product.model = model;
	if (category) product.category = category;
	if (condition) product.condition = condition;
	if (description) product.description = description;
	if (address) product.address = address;
	if (city) product.city = city;
	if (status) product.status = status;
	//// now update the product
	await product.save();
	//// sending response
	return responseFunc(res, "Product Updated Successfully", 200);
});

//===================================================
// http://localhost:8000/api/v1/products/bids/_id =  BID ON PRODUCT
// ==================================================
export const bidOnProduct = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	const product = await Product.findById(_id);
	let user = req.user;
	console.log(user);
	if (!product) return next(new CustomError("Product Is Not Available", 404));
	if (!user) return next(new CustomError("Your Id Not Found", 404));
	//// if product is available in database then go next
	const { price, description } = req.body;
	const myBid = { userId: user._id };
	if (!price) return next(new CustomError("Please Enter Price First", 400));
	if (price < product.minPrice) return next(new CustomError("Please Enter A Valid Price", 400));

	//// check user already bid or not
	product.bids.forEach((bid) => {
		if (bid.userId == user._id) {
			return next(new CustomError("For New Bid You Need To Delete You Old Bid", 400));
		}
	});
	//// if not provided anything
	myBid.price = Number(price);
	if (description) myBid.description = description;
	//// now update the product
	product.bids.push(myBid);
	await product.save();
	//// sending response
	return responseFunc(res, "Your Bid Added Successfully", 200);
});

//===================================================
// http://localhost:8000/api/v1/products/bids/_id =  DELETE YOUR BIDS
// ==================================================
export const deleteYourBid = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	const product = await Product.findById(_id);
	let userId = req.user._id;
	if (!product) return next(new CustomError("Product Is Not Available", 404));
	if (!userId) return next(new CustomError("Your Id Not Found", 404));
	//// if product is available in database then go next
	const newBids = product.bids.filter((bid) => {
		if (bid.userId != userId) return bid;
	});

	product.bids = newBids;
	await product.save();
	//// sending response
	return responseFunc(res, "Your Bids Deleted Successfully", 200);
});

//===================================================
// http://localhost:8000/api/v1/products/serch-products =  ALL PRODUCTS FOR SEARCH AND FILTERS
// ===================================================
export const mainSearchApi = TryCatch(async (req, res, next) => {
	const { category, model, search, city } = req.query;
	////  creating a logic of pages dataLimit on one page and skip data on page change
	//// creating searchQuery according given fields
	const searchBaseQuery = {};
	if (search) {
		searchBaseQuery.model = { $regex: new RegExp(String(search), "i") };
	}
	if (city) {
		searchBaseQuery.city = String(city);
	}
	if (category) {
		searchBaseQuery.category = String(category);
	}
	if (model) {
		searchBaseQuery.model = String(model);
	}

	const filteredProducts = await Product.find(searchBaseQuery);
	return responseFunc(res, "", 200, filteredProducts);
});
