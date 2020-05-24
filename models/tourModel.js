const mongoose=require('mongoose')
const slugify=require('slugify')
const validator=require('validator')
const User = require('./userModel')
const tourSchema=new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[30,'A tour name must have upto 30 characters'],
        minlength:[3,'A tour name must have atleast 3 characters']
        // validate:[validator.isAlpha, 'Tour name must only contain characters']
    },
    slug:String,
    duration: {
        type:Number,
        required: [true,'A tour must have a duration']
    }, 
    maxGroupSize: {
        type:Number,
        required: [true,'A tour must have a group size']
    },
    difficulty: {
        type:String,
        require: [true,'A tour must have a difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty is either: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type:Number,
        default:4.5 ,
        min:[ 1, 'Rating must be between 1.0-5.0'],
        max:[ 5, 'Rating must be between 1.0-5.0'],
        set: val => Math.round(val * 10) / 10   
    },
    ratingsQuantity: {
        type:Number,
        default:0
    },
    price: {
        type:Number,
        required:[true, "A tour must have a price"]   
    },
    priceDiscount: {
        type: Number,
        validate:{
            validator:function(val){
                //this only points to current doc on NEW document creation
        return val<this.price  
        },
        message: 'Discount Price ({VALUE}) should be below regular price'
        }
         
    },
    summary:{
        type:String,
        trim:true,
        required:[true, 'A tour must have a description']
    },
    description: {
        type:String,
        trim:true
    },
    imageCover: {
        type:String,
        required:[true, 'A tour must have a cover Image']
    },
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default:false
       
    },
    startLocation: {
        //GeoJson
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        addresss: String,
        description: String
    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:[Number],
            addresss:String,
            description:String,
            day:Number
        }
    ],
    
    guides:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
    },
    {
        toJSON: {virtuals:true},
        toObject: {virtuals:true}
    } 

)

//creating indexes
//tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1})
tourSchema.index({slug: 1})
tourSchema.index({ startLocation: '2dsphere' }) //real points on the earth

//virtual populate  for reviews
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField: 'tour',
    localField: '_id' 
})


tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7

})

//DOCUMENT MIDDLEWARE: runs before .save() and .create() //not .insertMany()

// tourSchema.pre('save', async function(next){
//     const guidesPromises=this.guides.map(async id => await User.findById(id))
//     this.guides=await Promise.all(guidesPromises)
//     next()
// })

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select:'-__v -passwordChangedAt'
    }) 
    next()
})

tourSchema.pre('save', function(next){
   this.slug=slugify(this.name, {lower:true})
  next()
})
/*tourSchema.pre('save', function(next){
    console.log('will save the document .........')
    next()
})
tourSchema.post('save',function(doc,next){
    console.log(doc)
next()
})
*/

//QUERY MIDDLEWARE secrecy
//tourSchema.pre('find',function(next){
tourSchema.pre(/^find/,function(next){ 
this.find({secretTour: {$ne:true } })
this.start=Date.now()
    next()
})
tourSchema.post(/^find/,function(doc,next){
    console.log(`Query took ${Date.now()-this.start} milliseconds`)
 //  console.log(doc)
    next()
    })
//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({$match:{secretTour:{ $ne:true}}})
//     console.log(this.pipeline())
//     next()
// })

//creating model
const Tour=mongoose.model('Tour',tourSchema)

module.exports=Tour