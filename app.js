const express=require('express')
const path=require('path')
const morgan=require('morgan')
const helmet=require('helmet')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')
const userRouter=require('./routes/userRouter')
const tourRouter=require('./routes/tourRouter')
const reviewRouter=require('./routes/reviewRouter')
const bookingRouter=require('./routes/bookingRoutes')
const viewRouter=require('./routes/viewRoutes')
const  AppError=require('./utils/appError')
const globalErrorHandler=require('./controllers/errorController')


const app=express()

app.set('view engine','pug')
app.set('views', path.join(__dirname, 'views'))

//serving static files
app.use(express.static(path.join(__dirname,'public')))



//1.GLOBAL MIDDLEWARES
app.use(helmet()) //set security http


if(process.env.NODE_ENV='development'){  //development logging
app.use(morgan('dev'))
}

const limiter= rateLimit({  //limit requests from same api
    max:100,
    windowMs: 60*60*1000,
    message: "To many request from this Ip. Please try again after one hour!"
})
app.use('/api', limiter) 

//body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'})) //limit the amount of data in the body
//reading cookies from clients
app.use(cookieParser())
//allow passsing data from form/ traditional update
app.use(express.urlencoded({ extended: true, limit: '10kb'}))

//data sanitization against NoSQL query injection
app.use(mongoSanitize()) //removes $" 
//Data sanitization against XSS
app.use(xss()) //removes html and scripts

app.use(hpp({   //prevent http parameter pollution duplicate fields incooperation
    whitelist:[
     'duration','ratingsQuantity','ratingAverage',  //array to allow duplicate in the string
      'price','difficulty','maxGroupSize']
}))


//Test middleware
app.use((req,res,next)=>{
// console.log(req.headers) 
//console.log(req.headers)
req.requestTime=new Date().toISOString()
//console.log(req.cookies) 
next() 
})

// app.get('/api/v1/tours',getAlltours)
// app.get('/api/v1/tours/:id?',getTour)
// app.post('/api/v1/tours',createTour)
// app.patch('/api/v1/tours/:id',updateTour)
// app.delete('/api/v1/tours/:id',deleteTour)


//3. ROUTES
app.use('/', viewRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/reviews',reviewRouter)
app.use('/api/v1/bookings',bookingRouter)

app.all('*',(req,res,next)=>{
    next(new AppError(`Cant find ${req.originalUrl} on this server`,404) )
})

app.use(globalErrorHandler)

//4. START SERVER
module.exports=app