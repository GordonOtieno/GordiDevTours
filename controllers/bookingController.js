const stripe=require('stripe')('sk_test_1ZCJxtBBfMnTxpA3HQm1Fmvq005yBFFWxq')
const Tour=require('../models/tourModel')
const Booking=require('../models/bookingModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const factory= require('./handlerFactory')

// exports.getAllBookings = catchAsync(async(req,res,next)=>{
//       let filter={}
//       if(req.params.tourId) filter = {tour: req.params.tourId}
//       const bookings = await Booking.find(filter)
//       res.status(200).json({
//          status: 'success',
//          data:{
//              bookings
//          } 
//       })
// })

exports.getCheckoutSession =catchAsync(async (req,res,next)=>{
    //get the currently booked tour
 const tour = await Tour.findById(req.params.tourId)
     console.log(tour)
    //create  checkout session 
 const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'], 
     success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,

     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
     customer_email: req.user.email,
     client_reference_id: req.params.tourId, //help get access to the object after success
     line_items: [
         {
             name: `${tour.name} Tour`,
             description: tour.summary,
             images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
             amount: tour.price * 100,
             currency: 'ksh',
             quantity: 1
         } 
     ]
 })
    //create session as a response
    res.status(200).json({
        status: 'success',
        session
    })
})
 //populate booking collection
exports.createBookingCheckout = catchAsync(async(req,res,next) => {
    //This is temporary. It is unsecured. anyone can make booking without paying 
    
    const { tour, user,price} = req.query
    if(!tour && !user && !price) return next()
    await Booking.create({tour, user, price})

    //next()// not secure it contains crusial payment info. this loop is prefered
    //original url- the entire url from which the request came from
    res.redirect(req.originalUrl.split('?')[0])
})



exports.getAllBookings =factory.getAll(Booking)
exports.getBooking  = factory.findOne(Booking)
exports.createBooking = factory.createOne(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)