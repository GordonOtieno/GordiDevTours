const AppError = require('../utils/appError')
const catchAsync= require('../utils/catchAsync')
const APIFeatures=require('../utils/APIFeatures')

exports.deleteOne = Model => catchAsync(async (req,res,next)=>{
    
    const doc= await Model.findByIdAndDelete(req.params.id)
     if(!doc){
       return next(new AppError('No document found with the ID',404))
     }
           res.status(204).json({
               status:"Success",
               data:null
           })
   })


   exports.updateOne = Model => catchAsync(async (req,res,next)=>{
    const doc= await Model.findByIdAndUpdate(req.params.id, req.body, {new:true,
   runValidators:true})
   if(!doc){
       return next(new AppError('No document found with the ID',404))
     }
           res.status(200).json({
               status:"Success",
               data:{
                data: doc
               }
           })  
   })

   exports.createOne= Model => catchAsync(async (req,res,next)=>{
    const doc=await Model.create(req.body)
        res.status(201).json({
            status:'Success',
            data:{ 
                data:doc
            }        
      })
})

exports.findOne = (Model, popOptions)=> 
catchAsync(async (req,res,next)=>{ 
   let query= Model.findById(req.params.id)
   if(popOptions) query=query.populate(popOptions)
  const doc=await query
if(!doc){
return next(new AppError('No Document found with the ID',404))
}
  res.status(200).json({
      status:'Success!',
      data:{
          data:doc
      }      
  })
  
})

exports.getAll = Model => catchAsync (async (req,res,next)=>{  

  //EXCECUTE THE QUERY
  const features= new APIFeatures(Model.find(), req.query)
  .filter()
  .sort()
  .limitFields()
  .paginate()
    // const doc=await features.query.explain()
    const doc=await features.query
  //query.sort().selct().skip().limit()
  //SEND RESPONSE
      res.status(200).json({
          status:'Success!',
          results:doc.length,
          data:{
              data:doc
          }
      })
  })