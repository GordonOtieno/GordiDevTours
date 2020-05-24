const mongoose= require('mongoose')

process.on('uncaughtException',err=>{
    console.log(err)
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down..... ')
    console.log(err.name,err.message)
    process.exit(1)
})
const app=require('./app')
const dotenv= require('dotenv')
dotenv.config({path:'./config.env'})

const DB=process.env.DATABASE.replace(
    '<PASSWORD>',process.env.DATABASE_PASSWORD)

    //real database
    mongoose.connect(DB,{
        useNewUrlParser:true,
        useUnifiedTopology: true,
        userCreateIndex:true,
        userFindAndModify:false
    }).then((con)=>{
 // console.log(con.connections)
  console.log('Db connection successful')
    })

// //local connection
// mongoose.connect(process.env.DATABASE_LOCAL,{
//     userNewUrlParser:true,
//     userCreateIndex:true,
//     userFindAndModify:false
// }).then(()=>console.log('Db connection successful'))

console.log(app.get('env'))
//console.log(process.env)
const port=process.env.PORT || 3000
 const server = app.listen(port,()=>{
    console.log(`App running on port ${port}`)
})
//unhandled rejection and gradual shut of server
process.on('unhandledRejection',err=>{
    console.log(err.name,err.messsage)
    console.log('UNHANDLED REJECTION! 💥 Shutting down..... ')
    server.close(()=>{
    process.exit(1)   //0 success/ 1 uncought exce
  })
  console.log(err)
})  
