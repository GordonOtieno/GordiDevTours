const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const {promisify}=require('util')
const User=require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const Email=require('../utils/email')


const signToken = id=>{
                 //payload           secrete  //secret should be 32 xters
  return  jwt.sign({ id }, process.env.JWT_SECRET, 
    {expiresIn: process.env.JWT_EXPIRES_IN })
}
//create cookie
const createSendToken= (user,statusCode,res)=>{
    const token=signToken(user._id)
    const cookieOptions={  
        expiresIn: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            
            httpOnly: true
    }
    if(process.env.NODE_ENV ==='production') cookieOptions.secure = true
       res.cookie('jwt',token,cookieOptions)
    //remove the password from cookies output
    user.password=undefined
    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    })
}

exports.signUp=catchAsync(async (req,res,next)=>{
 const newUser=await User.create(req.body) 

 //const url='http://127.0.0.1:8000/me' this in a my accout
 const url = `${req.protocol}://${req.get('host')}/me` 
 await new Email(newUser, url).sendWelcome()
 
 
 createSendToken(newUser,201,res)
})

exports.login= catchAsync(async(req,res,next)=>{
   // const email=req.body.email
   const {email,password}=req.body
 //chk if email and password exist
  if(!email || !password){
    return next(new AppError('Please provide email and password',400))
  }
 //chk if username exist and password correct
 const user=await User.findOne({ email }).select('+password') // explicite select the unselected
 //correctPassword is from the user model
 if(!user || (!await user.correctPassword(password,user.password))){ //correctPassword intance method in the model
     return next(new AppError('Inccorrect Email or password',401))
 } 

 //if all is okay, sign a web token and send
 createSendToken(user,200,res)
})

exports.logout= (req,res)=>{
    res.cookie('jwt', 'loggedout',{
        expiresIn: new Date(Date.now()+ 10*1000),
        httpOnly: true
    })
    res.status(200).json({status: "success"})
}

    exports.protect=catchAsync(async (req,res,next)=>{
        //1) get the token and ckeck if it exist
        let token
        if(req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')
            ){
        token=req.headers.authorization.split(' ')[1]

        }else if(req.cookies.jwt){
            token=req.cookies.jwt
        }
        //console.log(token)

        if(!token){
            return next(new AppError("You are not logged in, Please log in before you continue.",401))
        
            }
        //2) varification token. the function returns a promise instead of using callback function
        const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
        console.log(decode)
        //3) chk if user still exist  //id in the decoded payload
        const currentUser = await User.findById(decode.id)
        if(!currentUser){
            return next(new AppError('The user of the token no longer exist.',401))
        }
         //3) chk if the user changed pass after the token was issued
         //changedPasswordAfter- from users thin controller
         if(currentUser.changedPasswordAfter(decode.iat)){
            return next(new AppError('User recently changed password! Please log in again.'))
        }


        //grand access to protected route
        req.user=currentUser
        res.locals.user=currentUser 
            next()
    })

exports.isLoggedIn = async (req,res,next)=>{
try{
    if(req.cookies.jwt){
        //verify token  
        const decode = await promisify(jwt.verify)
        (req.cookies.jwt,
         process.env.JWT_SECRET)
    
        //3) chk if user still exist  //id in the decoded payload
        const currentUser = await User.findById(decode.id)
        if(!currentUser){
            return next()
        }
            //chk if the user changed pass after the token was issued
        if(currentUser.changedPasswordAfter(decode.iat)){
            return next()
        }
    
        //There is a logged in user
        res.locals.user = currentUser
            return next()
    } 
} catch(err) {
    return next() 
}

next() 
}


//will accept arguments. the rest parameter syntax 
exports.restrictTo = (...roles)=>{
   // this is the middleware it uses the power of closure
  return (req,res,next)=>{
      //roles['admin','lead-guide']
 if(!roles.includes(req.user.role)){
     return next(new AppError('You do not have permission to perform this action',403))
 }
 next()
  }
}

exports.forgotPassword=catchAsync(async (req,res,next)=>{
//1. get user based on the posted email
const user= await User.findOne({email: req.body.email })
if(!user){
    return next(new AppError('There is no user with the email address',404))
}

//2. generate the random reset token
const resetToken=user.createPasswordResetToken()
 await user.save({validateBeforeSave:false})

//3. send it to the users email
//create url
    try{
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}` 
    await new Email(user,resetURL).sendPasswordReset()
 
res.status(200).json({
    status: 'success',
    message: 'Token sent to email!'
})
}catch(err){
    user.createPasswordResetToken=undefined
    user.passwordResetExpires=undefined
    await user.save({validateBeforeSave:false})

    return next(new AppError('There was an error sending the email. Try again later',500))
}
})

exports.resetPassword =catchAsync (async(req,res,next) => {
    //get user based on the token
  const hashedToken=crypto.createHash('sha256')
  .update(req.params.token)
  .digest('hex')
// the only thing we know about the user now is passreset time
  const user=await User.findOne({passwordResetToken:hashedToken,
  passwordResetExpires: {$gt: Date.now()}})

    //2. If token has not expired andthere is a user, send new password
    if(!user){
        return next(new AppError('The token is Invalid or has expired',400))
    }
    //3. update changed password at property for the user
    user.password=req.body.password
    user.passwordConfirm = req.body.passwordConfirm 
    //delete the values of the two
    user.passwordResetToken=undefined
    user.passwordResetExpires=undefined
    await user.save(); //validation is required so no turning off
    
    //log the user in.
    createSendToken(user,200,res)
})

//logged in password Update

exports.updatePassword =catchAsync(async (req,res,next) =>{

    //1) get user from collection
const user= await User.findById(req.user.id).select('+password')
console.log("what is user"+user)
    //2. Check if posted current password is correct
if(!(await user.correctPassword(req.body.passwordCurrent, user.password ))){
    return next(new AppError('Your current password does not match our records',401))
}
    //3. If so, update password
user.password=req.body.password
user.passwordConfirm=req.body.passwordConfirm
await user.save()
    //4. Log user in, send jwt
    createSendToken(user,200,res)
})
