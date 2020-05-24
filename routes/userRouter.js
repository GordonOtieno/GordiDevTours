const express=require('express')
const userController=require('../controllers/userController')
const authController=require('../controllers/authController')

const router=express.Router()

router.post('/signUp', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

router.use(authController.protect) 
router.patch('/updateMyPassword', authController.updatePassword)
router.patch('/updateMyProfile',userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe)
router.delete('/deleteMyProfle', userController.deleteMe)

router.get('/me',userController.getMe,userController.getUser)

router.use(authController.restrictTo('admin'))

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)


module.exports=router