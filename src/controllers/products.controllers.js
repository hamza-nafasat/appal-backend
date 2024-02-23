import { TryCatch } from "../middlewares/errorHandler.js";
import Product from "../models/products.model.js";
import User from "../models/user.model.js";
import CustomError from "../utils/customClass.js";
import { deletePhoto, responseFunc } from "../utils/features.js";
import faker2 from "faker";

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
		photos.forEach((photo) => {
			deletePhoto(photo.path);
		});
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
		ownerId: req.query._id,
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
	let { userId } = req.query;
	let products = await Product.find({ ownerId: userId });
	return responseFunc(res, "All Adds Received", 200, products);
});
// ====================================================
// http://localhost:8000/api/v1/products/my-all-wishlists = getWishListProducts
// ====================================================
export const myWishLists = TryCatch(async (req, res, next) => {
	let { wishlists } = req.body;
	const products = await Product.find({ _id: { $in: wishlists } });
	return responseFunc(res, "WishList ReceIved", 200, products);
});

// =========================================
// http://localhost:8000/api/v1/products/_id =  GET SINGLE PRODUCT
// ==========================================
export const getSingleProduct = TryCatch(async (req, res, next) => {
	const { _id } = req.params;
	const product = await Product.findById(_id);
	if (!product) return next(new CustomError("Product Not Found", 404));
	const response = { product };
	const owner = await User.findById(product.ownerId);
	if (owner) response.owner = owner;
	else response.owner = "Owner Not Found";
	return responseFunc(res, "Product Received Successfully", 200, { product, owner });
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
	const { userId } = req.query;
	const product = await Product.findById(_id);
	if (!product) return next(new CustomError("Product Is Not Available", 404));

	//// if product is available in database then go next
	const { price, description } = req.body;
	let myBid = { userId: userId, createdAt: Date.now() };
	console.log("working");
	if (!price) return next(new CustomError("Please Enter Price First", 400));
	if (price < product.minPrice) return next(new CustomError("Please Enter A Valid Price", 400));

	//// check user already bid or not
	if (product.bids > 0) {
		product.bids.forEach((bid) => {
			if (bid.userId == userId) {
				return next(new CustomError("For New Bid You Need To Delete You Old Bid", 400));
			}
		});
	}
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
	const userId = req.query._id;
	const user = await User.findById(userId);
	if (!product) return next(new CustomError("Product Is Not Available", 404));
	if (!user) return next(new CustomError("User Not Found", 404));
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
// http://localhost:8000/api/v1/products/latest =  latest 5 products for all categories
// ===================================================

export const latestProduct = TryCatch(async (req, res, next) => {
	const categories = ["iphone", "ipad", "airpod", "mackbook", "watch", "homepod"];

	const promises = categories.map((category) => {
		return Product.find({ category: category }).sort({ date: -1 }).limit(5).exec();
	});
	const [iphone, ipad, airpod, mackbook, watch, homepod] = await Promise.all(promises);
	const response = {};
	if (iphone.length > 0) response.iphone = iphone;
	if (ipad.length > 0) response.ipad = ipad;
	if (airpod.length > 0) response.airpod = airpod;
	if (mackbook.length > 0) response.mackbook = mackbook;
	if (watch.length > 0) response.watch = watch;
	if (homepod.length > 0) response.homepod = homepod;

	return responseFunc(res, "", 200, response);
});

//===================================================
// http://localhost:8000/api/v1/products/search-products =  ALL PRODUCTS FOR SEARCH AND FILTERS
// ===================================================
export const mainSearchApi = TryCatch(async (req, res, next) => {
	const { category, model, search, city, price } = req.query;
	//// creating searchQuery according given fields
	const searchBaseQuery = {};
	if (search) {
		searchBaseQuery.model = { $regex: new RegExp(String(search), "i") };
	}
	if (city) {
		searchBaseQuery.city = { $regex: new RegExp(String(city), "i") };
	}
	if (category) {
		searchBaseQuery.category = String(category.toLowerCase());
	}
	if (model) {
		searchBaseQuery.model = String(model.toLowerCase());
	}
	if (price) {
		searchBaseQuery.maxPrice = {
			$lte: Number(price),
		};
	}
	const filteredProducts = await Product.find(searchBaseQuery);
	return responseFunc(res, "", 200, filteredProducts);
});

// ======== Function to generate fake product data =======
const generateFakeProductData = (category) => {
	let model;
	switch (category) {
		case "iphone":
			model = faker2.random.arrayElement([
				"iPhone 15 Pro Max",
				"iPhone 15 Pro",
				"iPhone 15 Plus",
				"iPhone 15",
				"iPhone 14 Pro Max",
				"iPhone 14 Pro",
				"iPhone 14 Plus",
				"iPhone 14",
				"iPhone 13 Pro Max",
				"iPhone 13 Pro",
				"iPhone 13 mini",
				"iPhone 13",
				"iPhone 12 Pro Max",
				"iPhone 12 Pro",
				"iPhone 12 mini",
				"iPhone 12",
				"iPhone SE ",
				"iPhone 11 Pro Max",
				"iPhone 11 Pro",
				"iPhone 11",
				"iPhone XR",
				"iPhone XS Max",
				"iPhone XS",
				"iPhone X",
				"iPhone 8 Plus",
				"iPhone 8",
				"iPhone 7 Plus",
				"iPhone 7",
				"iPhone 6S Plus",
				"iPhone 6S",
				"iPhone 6 Plus",
				"iPhone 6",
			]);
			break;
		case "ipad":
			model = faker2.random.arrayElement([
				"iPad (1st generation)",
				"iPad 2",
				"iPad (3rd generation)",
				"iPad (4th generation)",
				"iPad (5th generation)",
				"iPad (6th generation)",
				"iPad (7th generation)",
				"iPad (8th generation)",
				"iPad (9th generation)",
				"iPad Air",
				"iPad Air 2",
				"iPad Air (3rd generation)",
				"iPad Air (4th generation)",
				"iPad Pro (1st generation)",
				"iPad Pro (2nd generation)",
				"iPad Pro (3rd generation)",
				"iPad Pro (4th generation)",
				"iPad Pro (5th generation)",
			]);
			break;
		case "airpod":
			model = faker2.random.arrayElement([
				"AirPods Gen1",
				"AirPods Gen2",
				"AirPods Gen3",
				"AirPods Pro",
				"AirPods Max",
			]);
			break;
		case "mackbook":
			model = faker2.random.arrayElement([
				"MacBook Pro 14-inch (M2 Pro)",
				"MacBook Pro 14-inch (M2 Max)",
				"MacBook Pro 16-inch (M2 Pro)",
				"MacBook Pro 16-inch (M2 Max)",
				"MacBook Air (M2)",
				"MacBook Pro 13-inch (M1, 2020)",
				"MacBook Air (M1, 2020)",
				"MacBook Pro 16-inch (Intel, 2019)",
				"MacBook Pro 13-inch (Intel, 2019)",
				"MacBook Air (Intel, 2018)",
				"MacBook 12-inch (Intel, 2017)",
			]);
			break;
		case "watche":
			model = faker2.random.arrayElement([
				"Apple Watch Series 8 (GPS)",
				"Apple Watch Series 8 (Cellular)",
				"Apple Watch Series 8 Nike",
				"Apple Watch Series 8 (Hermes)",
				"Apple Watch SE (GPS)",
				"Apple Watch SE (Cellular)",
				"Apple Watch Series 7 (2021)",
				"Apple Watch Series 6 (2020)",
				"Apple Watch SE (2020)",
				"Apple Watch Series 5 (2019)",
				"Apple Watch Series 4 (2018)",
				"Apple Watch Series 3 (2017)",
			]);
			break;
		case "homepod":
			model = faker2.random.arrayElement(["HomePod Mini", "HomePod"]);
			break;
		default:
			model = faker2.random.word();
			break;
	}

	const now = new Date();
	const oneYearAgo = new Date(now);
	oneYearAgo.setFullYear(now.getFullYear() - 1);
	const createdAt = faker2.date.between(oneYearAgo, now);

	return {
		minPrice: faker2.datatype.number(),
		maxPrice: faker2.datatype.number(),
		photos: [`uploads/image_e9fd1104-0fcb-4112-b5e2-e2749493923d_image.png`],
		category: category.toLowerCase(),
		model: model.toLowerCase(),
		condition: faker2.random.arrayElement(["new", "refurbished", "used"]),
		description: faker2.lorem.sentence(),
		address: faker2.address.streetAddress(),
		city: faker2.address.city(),
		ownerId: "XZyQJUr3SaQg53NLhFT7EwcmIQH3",
		status: faker2.random.arrayElement(["available", "sold", "paused"]),
		bids: Array.from({ length: faker2.datatype.number({ min: 1, max: 5 }) }, () => ({
			userId: "XZyQJUr3SaQg53NLhFT7EwcmIQH3",
			price: faker2.datatype.number(),
			description: faker2.lorem.sentence(),
			createdAt: createdAt,
		})),
		createdAt: createdAt,
	};
};
export const latestProduct2 = TryCatch(async (req, res, next) => {
	const categories = ["iphone", "ipad", "airpod", "mackbook", "watche", "homepod"];
	const fakeProducts = [];
	for (const category of categories) {
		const categoryFakeProducts = Array.from({ length: 10 }, () =>
			generateFakeProductData(category)
		);
		fakeProducts.push(...categoryFakeProducts);
	}
	try {
		await Product.create(fakeProducts);
		return responseFunc(res, "", 200, "Fake products added successfully");
	} catch (error) {
		console.error("Error adding fake products:", error);
		return responseFunc(res, "Internal Server Error", 500);
	}
});
