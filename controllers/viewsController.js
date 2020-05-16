const Tour=require('../models/tourModel')
const User=require('../models/userModel')
const Booking=require('../models/bookingModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')

exports.getOverview = catchAsync(async(req,res,next)=>{
const tours=await Tour.find()
    //build template
    //Render that templates using tour data from 1
    res.status(200).render('overview', {
        isbooked: false,
        title: 'All Tours',
         tours
    })
})
exports.getTour = catchAsync (async(req, res, next)=>{
    //get the data for the requested tour including reviews and guide
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
     path: 'reviews',
     fields: 'review rating user'   
    })
   if(!tour){
    return next (new AppError("There is no tour with that name",404))
     }

    res.status(200).render('tour',{
         title:`${tour.name} Tour`,
         tour
     })
 })

 exports.getloginForm = (req, res)=>{
     res.status(200).render('login',{
         title: 'Login into Your Account'
     })
 }

 exports.getSignUpForm = (req, res) => {
     res.status(200).render('signup',{
         title: 'Create an Account'
     })
 }


 exports.getAccount = (req,res)=>{
     res.status(200).render('account',{
         title: 'My Account'
     })
 }

 exports.getMytours = catchAsync(async(req,res,next)=>{
     //Find tours booking for logged in user
 const bookings= await Booking.find({ user: req.user.id})

     //Find tours with the return id
     const tourIDs = bookings.map(el => el.tour)
     const tours= await Tour.find({_id: {$in: tourIDs}})
    

     res.status(200).render('overview', {
         isbooked: true,
         title: 'My Tours',
         tours
     })
 })

 exports.updateUserData=catchAsync(async(req,res, next)=>{
     //console.log('UPDATING USER', req.body)
     const updatedUser = await User.findByIdAndUpdate(req.user.id, {
         name: req.body.name,
         email: req.body.email
     },{
         new: true,
         runValidators: true
     })
     res.status(200).render('account',{
        title: 'My Account',
        user: updatedUser
    })
 })