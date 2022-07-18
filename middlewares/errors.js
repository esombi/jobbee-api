const ErrorHandler = require('../utils/errorHandler');
const errorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) =>{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error.';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            errMessage: err.message,
            stack: err.stack
        })
    } 
 
    if (process.env.NODE_ENV === 'production ') {
        let error = {...err};

        error.message = err.message;

        //Wrong Mongoose object ID Error
        if(err.name === 'castError') {
            const message = `Resource not found. Invalid ${err.path}`;
            error = new ErrorHandler(message, 404);
        }

        //Handling Validation error
        if(err.name === 'ValidationError'){
            const message = Object.values(err.errors).map(value => value.message);
            error = new ErrorHandler(message, 404)
        }

        //Handle mongoose duplicate key error
        if(err.code === 11000) {
            const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
            error = new ErrorHandler(message, 400)
        }

        // Handle wrong JWT token error
        if(err.name === 'JsonWebTokenError'){
            const message = 'JSON Web token is invalid. Try Again!';
            error = new ErrorHandler(message, 500);
        }

        // Handle Expired JWT token error
        if(err.name === 'TokenExpiredError'){
            const message = 'JSON Web token is expired. Try Again!';
            error = new ErrorHandler(message, 500);
        }


        res.status(error.statusCode).json({
            success: false,
            message: error.message || 'Internal Server Error'
        })
        
    }

}