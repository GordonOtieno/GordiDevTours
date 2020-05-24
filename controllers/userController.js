const multer = require('multer')  //reading files
const sharp = require('sharp')    //image processing resizing
const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const factory=require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     //console.log(req.file) to get the memtype proprties
//     filename: (req, file, cb)=>{
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })
//keep file in buffer memory before resizing
const multerStorage = multer.memoryStorage()

//check if the uploaded file is an image/ what is to be uploaded
const multerFilter = (req, file,cb) => {
  if(file.mimetype.startsWith('image')){
      cb(null, true)
  }else{
      cb(new AppError('The uploaded file is not an Image! Please upload only images',400),false)
  }
}

const upload = multer({storage: multerStorage,
                       fileFilter: multerFilter })

exports.uploadUserPhoto = upload.single('photo')


//RESIZE THE IMAGE
exports.resizeUserPhoto = catchAsync(async(req,res,next)=>{
    if(!req.file) return next()
    //buffer does not create filename so it is redefined
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
 await sharp(req.file.buffer)  //return a promise
   .resize(500,500)
   .toFormat('jpeg')
   .jpeg({quality: 90})
   .toFile(`public/img/users/${req.file.filename}`)

   next()
})


const filterObj = (obj, ...allowedFields)=>{
    //loop through the object to find a match
    const newObj = {}
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj 
}

exports.getMe = (req,res,next) => {
    req.params.id= req.user.id;
     next()
}


exports.updateMe =catchAsync(async(req,res,next)=>{
   // console.log(req.file)
   // console.log(req.body)
    // create error if user posts password data
if(req.body.password || req.body.passwordConfirm){
    return next(new AppError("This route is not for password update. Please use /updateMyPassword.",400))     
}
 
 // filter out unwanted documents only allow name and email no role changing
const filteredBody=filterObj(req.body, 'name','email')
if(req.file) filteredBody.photo = req.file.filename // from console.log(req.file)

const updatedUser=await User.findByIdAndUpdate(req.user.id, filteredBody,{
    new: true,
    runValidators:true
})
//update user document
res.status(200).json({
    status:"success",
    data:{
        user: updatedUser
    }
})
})

exports.deleteMe=catchAsync (async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id, {active: false})

res.status(204).json({
    status:'Success',
    data:null
})
})


exports.createUser=((req,res)=>{
    res.status(500).json({
        status:"error",
        message:"route not defined. Please Use SignUp instead."
    }) 
})

exports.getAllUsers= factory.getAll(User)
exports.getUser=factory.findOne(User)
//Do not update passwords with this findByIdAndUpdate save middleware wont work
exports.updateUser=factory.updateOne(User)
exports.deleteUser=factory.deleteOne(User)