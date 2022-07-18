const User = require('../models/users');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const ErrorHandler = require('../utils/errorHandler');
const sendToken = require('../utils/jwtTokens');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

//Register a user => /api/v1/register
exports.registerUser = catchAsyncErrors(async(req, res, next) =>{
    const {name,email,password,role} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        role
    })

     //Create JSON web token
     sendToken(user, 200, res);
});

// Login User => /api/v1/login
exports.loginUser = catchAsyncErrors( async (req, res, next) =>{
    const { email, password } = req.body;

    //check if email or password is entered by user
    if(!email || !password){
        return next(new ErrorHandler('Please enter email & password'), 400);
    }

    //finding user in database 
    const user = await User.findOne({email}).select('+password');

    if(!user) {
        return next(new ErrorHandler('Invalid email or password.', 401))
    }

    // check if password is correct
    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid valid email or password.', 401))
    }

    //Create JSON web token
    sendToken(user, 200, res);
});

//Forgot Password => /api/v1/password/forgot
exports.forgotPassword = catchAsyncErrors( async (req, res, next) =>{
    const user = await User.findOne({email: req.body.email});

    if(!user) {
        return next(new ErrorHandler('No user found with this email.', 404))
    }

    //Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    //create password reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset link is as follows: \n\n${resetUrl}
    \n\n If you haven't requested this, please ignore`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Jobbee-API Password Recovery',
            message
        })
    
        res.status(200).json({
            success: true,
            message: `Email sent successfully to:  ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler('Email is not sent. '), 500);
    }

    
});

//Reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
    //Hash url token
    const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorHandler('Password Reset token is invalid or expired. ', 400));
    }

    //set up new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
})

// Logout user => /api/v1/logout
exports.logout = catchAsyncErrors (async (req, res, next) =>{
    res.cookie('token', 'none', {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: 'Logged out successfully.'
    })
})