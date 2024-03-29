import path from "path";
import multer from "multer";
import { v4 as uuid } from "uuid";
import CustomError from "../utils/customClass.js";

const storage = multer.diskStorage({
	destination(req, file, callback) {
		callback(null, "uploads");
	},
	filename(req, file, callback) {
		callback(null, `${file.originalname.split(".")[0]}_${uuid()}_${file.originalname}`);
	},
});
const fileFilter = (req, file, callback) => {
	const allowedExtension = [".jpg", ".png", ".jpeg", ".webp"];
	const fileExtension = path.extname(file.originalname).toLowerCase();
	if (allowedExtension.includes(fileExtension)) {
		return callback(null, true);
	}
	callback(new CustomError("File Upload Error", 400));
};
const singleUpload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 },
}).single("photo");

const multiUpload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 10 * 1024 * 1024 },
}).fields([{ name: "photos", maxCount: 10 }]);

export { singleUpload, multiUpload };
