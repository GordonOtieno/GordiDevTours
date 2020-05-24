const express=require('express')
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')
const router=express.Router()

//router.use(authController.isLoggedIn)
//replace app with router
router.get('/',authController.isLoggedIn, viewsController.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewsController.isBooked, viewsController.getTour)
router.get('/login', authController.isLoggedIn, viewsController.getloginForm)
router.get('/signup', viewsController.getSignUpForm)
router.get('/me',authController.protect, viewsController.getAccount)
router.post('/submit-user-data', authController.protect, viewsController.updateUserData)
router.get('/my-tours', authController.protect, viewsController.getMytours)

module.exports = router