const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');

const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');

//Setting up config.env file variable
dotenv.config({path: './config/config.env'})

// Handling uncaught Exception
process.on('uncaughtException', err =>{
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1);
})
 
//connect to database
connectDatabase();

//Set up body parser
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

//set up security headers
app.use(helmet());

//set up body parser
app.use(express.json());

// Set cookie parser
app.use(cookieParser());

//Handle file uploads
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//prevent xss attack
app.use(xssClean());

//Prevent parameter pollution
app.use(hpp({
    whitelist: ['positions']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10*60*1000,  // 10 mins
    max: 100
});

// set up CORS - Accessible by other domain
app.use(cors());

app.use(limiter);

//Importing all routes
const jobs = require('./routes/jobs');
const auth = require('./routes/auth');
const user = require('./routes/user')

app.use('/api/v1', jobs);
app.use('/api/v1', auth);
app.use('/api/v1', user);

//Handle  unhandled routes
app.all('*', (req, res, next) =>{
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
});


//middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () =>{
    console.log(
        `Server is running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`
    );
})
 
//Handling unhandled Promise Rejection error
process.on('unhandledRejection', err =>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down server due to unhandled promise rejection');
    server.close( () =>{
        process.exit(1)
    })
});
