const AppError=require('./../utils/appError')


const handleCastErrorDB = err=>{
    const message=`invalid ${err.path}:${err.value}.`
    return new AppError(message,400)
}

const handleDupliateFieldDB= err=>{
    const value=err.errmsg.match(/(["'])(\\?.)*?\1/)[0] 
    console.log(value);
    const message=`Dublicate field value: ${value}. Please use another value!`
   return new AppError(message,400)
} 
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message=`Invalid input data. ${errors.join('. ')}`
    return new AppError(message,400)
}

const handleJWTError = () =>new AppError('Invalid Token, Please Log In again.',401)

const handleJWTExpiredError= ()=> new AppError('Your Access token has expired. Please Log in again',401)

const sendErrorDev= (err,req,res)=>{
//check the url API  
if(req.originalUrl.startsWith('/api')){
res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
} 
    //RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error',{
        title: 'Something went wrong!',
        msg: err.message
    })
  }    

const sendErrorProd=(err,req, res)=>{
    //a. API
//operational trusted errors: send message to client
if(req.originalUrl.startsWith('/api')){

    if(err.isOperatonal){
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
            })
              
//programming or other unknown error: dont leak error details      
//1. log erors   

//2. send generic message
}else{
    console.error('ERROR 💥', err)

    return res.status(500).json({
            status: 'error',
            message:'something went very wrong!'
        })
    }
}
    
//B) RENDERED WEBSITE
//operational trusted errors, send messages to client
 if(err.isOperatonal){
   return  res.status(err.statusCode).json({
        title: 'Something went wrong',
        msg: err.message
    })
 } 

 //b) Programming or other unknown errors, dont leak to clients
 // log error
 console.error('ERROR 💥', err)
//send generic message
return res.status(err.statusCode).render('error',{
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  })

}
module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500
    err.status=err.status || 'error'

    if(process.env.NODE_ENV ==='development '){
        sendErrorDev(err,req,res)
    }else if(process.env.NODE_ENV ==='Production'){
        let error={...err}
        error.message = err.message


        //these name comes from displayed errors in browser
        if(error.name === 'CastError') error=handleCastErrorDB(error)
        if(error.code ===11000) error = handleDupliateFieldDB(error)
        if(error.name == 'ValidationError') error = handleValidationErrorDB(error)
        if(error.name === 'JsonWebTokenError') error= handleJWTError()
        if(error.name === 'TokenExpiredError') error= handleJWTExpiredError()

        sendErrorProd(error,req,res)
      }
 }
