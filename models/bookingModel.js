const mongoose = require('mongoose')


const bookingSchema = new mongoose.Schema({

    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        require: [true, 'Booking must be for a Tour']
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Booking must be done by a member']
    },
    price: {
        type: Number,
        required: [true, 'Booking must have a price']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
})
//unique key no duplicate booking per Tour   instance methods
bookingSchema.index({tour: 1, user: 1}, {unique: true})

bookingSchema.pre(/^find/, function(next){
    this.populate('user').populate({
        path: 'tour',
        select: 'name'
    })
    next()
})

const Booking = mongoose.model('Booking', bookingSchema)
module.exports= Booking