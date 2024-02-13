import fs from "fs";
import mongoose from "mongoose";
import { nodeCash } from "../app.js";
import Product from "../models/products.model.js";
// =====================
// delete photo function
// =====================
export const deletePhoto = (path) => {
    fs.unlink(path, (err) => {
        if (err)
            console.log("Error deleting image", err.message);
        console.log("Image deleted Successfully");
    });
};
// ================================
// connectDB for connecting mongodb
// ================================
export const connectDB = async (uri, dbName) => {
    try {
        const response = await mongoose.connect(uri, { dbName });
        const { name, host, port } = response.connection;
        console.log(`DB ${name} is connected on mongodb://${host}:${port}`);
    }
    catch (error) {
        console.error(`MongoDB connection failed ${error.message}`);
        process.exit(1);
    }
};
// ===========================================
// send custom response function for every api
// ===========================================
export const responseFunc = (res, message, statusCode, data) => {
    const response = { success: true };
    if (message)
        response.message = message;
    if (data)
        response.data = data;
    res.status(statusCode || 200).json(response);
};
// ======================================
// invalidateNodeCash function which del
// ======================================
export const reduceStock = async (orderItem) => {
    for (let i = 0; i < orderItem.length; i++) {
        const product = await Product.findById(orderItem[i].productId);
        if (!product)
            throw new Error("Product Not Found");
        product.stock -= orderItem[i].Quantity;
        await product.save();
    }
};
// ========================================================
// invalidateNodeCash function which del data from nodeCash
// ========================================================
export const invalidateNodeCash = async ({ isProducts, isOrders, isAdmins }) => {
    if (isProducts) {
        let productsKeys = ["latest_products", "categories", "admin_products"];
        const productsId = await Product.find().select("_id");
        productsId.forEach((item) => {
            productsKeys.push(`product_${item._id}`);
        });
        nodeCash.del(productsKeys);
    }
    if (isOrders) {
    }
    if (isAdmins) {
    }
};
