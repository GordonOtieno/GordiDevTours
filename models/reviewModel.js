const mongoose= require('mongoose')
const Tour=require('./tourModel')
const reviewSchema=new mongoose.Schema({
review: {
    type: String,
    required: [true, 'Review cannot be empty!']
},

rating:{
    type: Number,
    max: 5,
    min: 1
},

createdAt: {
    type:Date,
    default:Date.now()
},

tour:   {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            require: [true, 'Reviews must have a tour']
        },
    

user: {
       type : mongoose.Schema.ObjectId,
       ref : 'User',
       require: [true, 'Reviews must belong to a User']
    }

},
{
    toJSON: {virtuals:true},
    toObject: {virtuals:true}
})
//unique key no duplicate reviews per Tour   instance methods
 reviewSchema.index({tour: 1, user: 1}, {unique: true})


//DOCUMENTS MIDDLEWARE
reviewSchema.pre(/^find/, function(next){
    // this.populate({
    //     path: 'tour',
    //     select:'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})

//ratings avearage on a particular tour calculator
reviewSchema.statics.calculateAverageRatings = async function (tourId){
    const stats = await this.aggregate([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: {$sum: 1}, //add one to the review documents available
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    
    //console.log(stats)  //significant in testing
   if(stats.length > 0){
     
      // update the fields in tours collection
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
        
    })
   }else{
       await Tour.findByIdAndUpdate(tourId,{
           ratingsQuantity: 0,
           ratingsAverage: 4.5
       })
   }
}
//update the review schema everytime new record is created
reviewSchema.post('save', function(){
//this points to the current review
this.constructor.calculateAverageRatings(this.tour)
    
})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){ 
  this.r = await this.findOne()
 //console.log(this.r)
  next()
})

reviewSchema.post(/^findOneAnd/, async function(){
    //await this.findOne() does not work here, query has already excecuted
  await this.r.constructor.calculateAverageRatings(this.r.tour) 
})


const Review = mongoose.model('Review',reviewSchema)
module.exports=Review