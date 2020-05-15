const express=require('express')
const viewsController = require('../controllers/viewsController')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')
const router=express.Router()

router.use(authController.isLoggedIn)
//replace app with router
router.get('/', bookingController.createBookingCheckout,
                viewsController.getOverview)
router.get('/tour/:slug', viewsController.getTour)
router.get('/login', viewsController.getloginForm)
router.get('/signp', viewsController.getloginForm)
router.get('/me',authController.protect, viewsController.getAccount)
router.post('/submit-user-data', authController.protect, viewsController.updateUserData)
router.get('/my-tours', authController.protect, vi