const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const crypto=require('crypto')

const userSchema=new mongoose.Schema({
    name: {
        type:String,
        required:[true, 'Name Field is required'],
        trim:true,
        minlength:[3, 'Name must be atleast 3 characters']
    },
    email: {
        type:String,
        required:[true, 'Email address is required'],
        unique:true,
        lowercase:true,
        validate: [validator.isEmail, 'Please provide a valid Email address']
    },

    photo: {
             type: String,
             default: 'default.jpg'
           
            },

    password: {
        type:String,
        required:[true,'Password is required'],
        minlength:[6, 'Password should have a minimum of 6 characters'],
        select:false
    },

    passwordConfirm:{
        type:String,
        required:[true, 'Password confirm is required'],
        validate:{
            //This only work on CREATE/SAVE
            validator: function(el){
            return el === this.password
        },
        message: 'Passwords do not match! Try again'
    }
 },
    role: {
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'

    },
passwordChangedAt: Date,
passwordResetToken: String,
passwordResetExpires: Date,
active:{
    type: Boolean,
    default:true,
    select:false
} 

})
//QUERY MIDDLEWARES

//passwordChangedAt update
userSchema.pre("save",function(next){ //password is modified or new doc
  if(!this.isModified('password') || this.isNew) return next()
//This ensures that the the field is modified after the password has been changed
  this.passwordChangedAt=Date.now()-1000
  next()
})

userSchema.pre('save', async function(next){
    //runs if [password was modified]
   if(!this.isModified('password'))return next()
   //hash passwod with cost of 12 
   this.password=await bcrypt.hash(this.password,12) 
   //delete the password
   this.passwordConfirm=undefined
   next()
})

userSchema.pre(/^find/, function(next){ //applied to get all to select only active users
 //this points to the current qery
 this.find({ active:{$ne: false} })
 next()
})

//Instance method returns true or false
userSchema.methods.correctPassword = async function(
    candidatePassword, userPassword
    ){
    return await bcrypt.compare(candidatePassword,userPassword)
}

userSchema.methods.changedPasswordAfter=function(JWTTimeStamp){
 if(this.passwordChangedAt){
     const changedTimestamp= parseInt(
         this.passwordChangedAt.getTime() / 1000, 10
     )
    // console.log(changedTimestamp,JWTTimeStamp)
     return JWTTimeStamp < changedTimestamp
 }
    return false
}

userSchema.methods.createPasswordResetToken= function(){
  //random cryptogenerated token
  const resetToken= crypto.randomBytes(32).toString('hex')
  //hash it the store in db for later comparison
 this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex')
 console.log({resetToken},this.passwordResetToken)
 
 this.passwordResetExpires=Date.now()+10*60*1000
 return resetToken //this is to be sent vi email
}

const User=mongoose.model('User',userSchema)

module.exports=User