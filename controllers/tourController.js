const fs=require('fs')
const multer = require('multer')
const sharp = require('sharp')
const Tour=require('../models/tourModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const factory= require('./handlerFactory')

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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1}, //both imageCover and images are 
    {name: 'images', maxCount: 3}
    // upload.single('image') console.log(req.file)
    // upload.array('images, 5')  console.log(req.files)
])

exports.resizeTourImages =catchAsync(async(req,res,next) =>{
    console.log(req.files)
   
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

    if(!req.files.imageCover || !req.files.images) return next()
  //1. cover image
    await sharp(req.files.imageCover[0].buffer)  //its an array of one
    .resize(2000,1333) //3:2 ratio
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/tours/${req.body.imageCover}`) //in db

    //2. Images
    req.body.images = []   //this is an array fields

  await Promise.all(  //map is prefered instead of forEach
    req.files.images.map(async (file, i)=>{
        const filename= `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`

        await sharp(file.buffer)
            .resize(2000,1333) //3:2 ratio
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${filename}`) 

            req.body.images.push(filename)
    })
   )
  // console.log(req.body) 
        next()
    })

exports.aliasTopTours=async (req,res,next)=>{
 req.query.limit='5'
 req.query.sort='-ratingsAverage,price'
 req.query.fields='name,price,ratingsAverage,summary,difficulty'
next()
}


// const catchAsync= (fn)=>{
//     return (req, res,next)=>{
//         fn(req,res,next).catch(err=>next(err))  //.catch(next)

//     }
// }

//2. ROUTE HANDLERS
exports.getAlltours=factory.getAll(Tour)
// exports. getAlltours=catchAsync(async (req,res,next)=>{  

// //EXCECUTE THE QUERY
// const features= new APIFeatures(Tour.find(), req.query)
// .filter()
// .sort()
// .limitFields()
// .paginate()
//     const tours=await features.query
// //query.sort().selct().skip().limit()
// //SEND RESPONSE
//     res.status(200).json({
//         status:'Success!',
//         results:tours.length,
//         data:{
//             tours:tours
//         }
//     })
// })

/*exports.getTour=async (req,res)=>{ 
   try {
       const tour=await Tour.findById(req.params.id)
    res.status(200).json({
        status:'Success!',
        data:{
            tour
        }      
    })
     }catch(err){
         res.status(404).json({
             status:"Error",
             message:err
         })
    }
}*/
exports.getTour=factory.findOne(Tour,{path:'reviews'})
//exports.getTour=factory.findOne(Tour,{path:'reviews'
                                //      select: '-_v -passwordChangedAt'
                                //      })
// exports.getTour=catchAsync(async (req,res,next)=>{ 
   
//      const tour=await Tour.findById(req.params.id).populate('reviews')
// if(!tour){
//   return next(new AppError('No tour found with the ID',404))
// }
//      res.status(200).json({
//          status:'Success!',
//          data:{
//              tour
//          }      
//      })
     
//  })
 
exports.createTour=factory.createOne(Tour)
// exports.createTour=catchAsync(async (req,res,next)=>{
//     const newTour=await Tour.create(req.body)
//         res.status(201).json({
//             status:'Success',
//             data:{ 
//                 tour:newTour
//             }        
//       })
// })
exports.updateTour=factory.updateOne(Tour)

// exports.updateTour=catchAsync(async (req,res,next)=>{
//  const tour= await Tour.findByIdAndUpdate(req.params.id, req.body, {new:true,
// runValidators:true})
// if(!tour){
//     return next(new AppError('No tour found with the ID',404))
//   }
//         res.status(200).json({
//             status:"Success",
//             data:{
//             tour
//             }
//         })  
// })

exports.deleteTour = factory.deleteOne(Tour)
// exports.deleteTour=catchAsync(async (req,res,next)=>{
    
//  const tour= await Tour.findByIdAndDelete(req.params.id)
//   if(!tour){
//     return next(new AppError('No tour found with the ID',404))
//   }
//         res.status(204).json({
//             status:"Success",
//             data:null
//         })
// })

/*"""""""""""""""""""""""""""""""""""""""
OTHER FUNCTIONS
//aggregation pipelining */
exports.getToursStats =catchAsync (async(req,res,next)=>{
    
const stats=await Tour.aggregate([
{
    $match: { ratingsAverage: {$gte:4.5} }

},
{
     $group: {
        _id: {$toUpper: '$difficulty'},   //group the documants by difficulty
        numTours: {$sum: 1},
        numRatings: {$sum: '$ratingsQuantity'},
        avgRating: { $avg: '$ratingsAverage'},
        avgPrice: { $avg: '$price'}, 
        minPrice: { $min: '$price'},
        maxPrice: { $max: '$price'} 
     }
},
{
     $sort: {avgPrice:1}
},
// {
//     $match:{_id: {$ne:'EASY'}}
// }
])
res.status(200).json({
    status:"Success",
    data:{
        stats
    }
})
   
})


exports.getMonthlyPlan= catchAsync (async (req,res,next)=>{
     const year=req.params.year*1  // 2021
   const plan=await Tour.aggregate([
       {
           $unwind:'$startDates'
         },
        {
           $match: {
               startDates: {
                  $gte: new Date(`${year}-01-01`), 
                  $lte: new Date(`${year}-12-31`)
               }
           } 
        },
        {
            $group: {
               _id:{$month: '$startDates'},
              numTourStarts: { $sum: 1}, 
              tours: {$push: '$name'}
            }
        },
        {
            $addFields: {month: '$_id'}
        },
        {
            $project:{
             _id: 0
            }
        },
        {
            $sort: {numTourStarts: -1}
        },
        {
            $limit:12
        }
   ])

     res.status(200).json({
        status:"Success",
        data:{
            plan
        }
    })

})

//geospacial query implementation
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-distance/233/center/-0.438697, 36.590024/unit/mi

exports.getToursWithin =catchAsync(async (req,res,next)=>{
    //use destructuring to get the variable at once
  const { distance,latlng,unit }=req.params
  const [lat,lng] = latlng.split(',')
  //converting the radius of the sphere to radiants distance/radius of earth
  const radius= unit ==='mi' ? distance / 3963.2 : distance / 6378.1
 //console.log(lat,lng,distance,unit)
  if(!lat || !lng){
      next(new AppError('Please provide latitude and longitude in the format lat, lng',400))
  }
//getting spheres with a specified location
const tours=await Tour.find({
    startLocation: {$geoWithin: { $centerSphere: [[lng, lat], radius ]}}

})

  res.status(200).json({
      status:'Success',
      results: tours.length,
      data:{
        data:tours
      }

  })
})

exports.getDistances = catchAsync(async(req,res,next)=>{
  const {latlng,unit}=req.params
  const [lat,lng] = latlng.split(',')
//converting metrest to miles or km
const multiplier = unit ==='mi'? 0.000621371 : 0.001
  if(!lat || !lng){
      next(new AppError('Please provide latitude and longitude in the format lat, log',400))
  }

  const distances=await Tour.aggregate([
      {
          //Atleas a field should have a geo index in schema
          $geoNear: {  //should be the first in pipeline
             near:{
                 type:'point',
                 coordinates: [lng*1, lat*1]
             },
             distanceField: 'distance',
             distanceMultiplier: multiplier  //specify a number to be multiplied by all the distances
          }
      },
      {
        $project: {
            distance: 1,
            name: 1
        }
    }
  ])
  res.status(200).json({
    status:'Success',
    data:{
      data:distances
    }
})
})