const express=require('express')
const tourController=require('../controllers/tourController')
const authController=require('../controllers/authController')
const reviewRouter=require('../routes/reviewRouter')
const bookingRoutes = require('../routes/bookingRoutes')
const router=express.Router()

router.use('/:tourId/reviews',reviewRouter)
router.use('/:tourId/bookings',bookingRoutes)

//param middleware
//router.param('id',tourController.checkID)
//create a middleware
//check id=f the body contain name and price property
//if not send 404 error message
//add it to the post controller
router
.route('/tour-stats').get(tourController.getToursStats)
router
.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAlltours)

//geospacial query implementation
// /tours-distance?distance=342&center=-40,45&unit=mi
// /tours-distance/233/center/-40,45/unit/mi
router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances)

router.
route('/monthly-plan/:year')
.get(authController.protect,
     authController.restrictTo('admin','lead-guide','lead'),
     tourController.getMonthlyPlan)

router
.route('/')
.get(tourController.getAlltours)
.post(authController.protect, 
      authController.restrictTo('admin','lead-guide'),
      tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
.delete(authController.protect,
        authController.restrictTo('admin','lead-guide'), tourController.deleteTour)

//POST/tour/24234/reviews
//GET/tour/656565/reviews
//GET/tour/667671f1/reviews/6563FT

  

module.exports=router

