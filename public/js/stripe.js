import axios from "axios"
import { showAlert } from './alert'
const stripe = Stripe('pk_test_exK8rRRqiRKAibrRdGNvIXFh00U0z9Ajcl')

export const bookTour = async tourId =>{
    try{
        //get checkout session API
        const session=await axios(`http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
        )
        console.log(session)
        //create checkout form + chanre credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    }catch(err){
        showAlert("error",err)
    }
}