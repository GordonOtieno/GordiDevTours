const fs = require('fs')
const mongoose= require('mongoose')
const dotenv= require('dotenv')
const Tour =require('../../models/tourModel')
const User =require('../../models/userModel')
const Review =require('../../models/reviewModel')

dotenv.config({path:'./config.env'})
/*
const connectionString=process.env.DATABASE.replace(
    '<PASSWORD>',process.env.DATABASE_PASSWORD)

    
    //real database
    mongoose.connect(connectionString,{
        userNewUrlParser:true,
        userCreateIndex:true,
        userFindAndModify:false
    }).then((con)=>{
  console.log(con.connections)
  console.log('Db connection successful')
    })
*/
//local connection
mongoose.connect(process.env.DATABASE_LOCAL,{
    userNewUrlParser:true,
    userCreateIndex:true,
    userFindAndModify:false
}).then(()=>console.log('Db connection successful'))

//READ JSON FILE
const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'))
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'))
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'))

//import data into db
const importData=async ()=>{
    try{
          await Tour.create(tours)
          await User.create(users, {validateBeforeSave: false})
          await Review.create(reviews)
          console.log("Data successfully loaded!")
          
    }catch(err){
   console.log(err)
    }
    process.exit()
}

//import data into db
const deleteData=async ()=>{
    try{
          await Tour.deleteMany()
          await User.deleteMany()
          await Review.deleteMany()
          console.log("Data successfully deleted!")
           
    }catch(err){
   console.log(err)
    }
    process.exit()
}



//console.log(process.argv)

if(process.argv[2] =='--import'){
    importData()
} 
else if(process.argv[2] =='--delete'){
    deleteData()
}
//node dev-data/data/import-dev-data.js --delete