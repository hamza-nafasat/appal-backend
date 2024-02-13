import CustomError from "../utils/customClass.js";
// CUSTOM ERROR MIDDLEWARE
// -----------------------
export const customErrorMiddleWare = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
// ASYNC AWAIT WRAPPER USING TRY CATCH
// ------------------------------------------
export const TryCatch = (func) => async (req, res, next) => {
    try {
        return await func(req, res, next);
    }
    catch (error) {
        if (error instanceof CustomError)
            return next(error);
        next(new CustomError(error.message, 500));
    }
};
// // ASYNC AWAIT WRAPPER USING PROMISES
// // ----------------------------------
// export const TryCatch = (fn: ApiFuncType) => (req: Request, res: Response, next: NextFunction) =>
// 	Promise.resolve(fn(req, res, next)).catch((err) => {
// 		if (err instanceof CustomError) return next(err);
// 		next(new CustomError("Internal Server Error", 500));
// 	});
