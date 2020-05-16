import axios from 'axios'
import {showAlert} from './alert'

 export const signup = async(name,email,password,passwordConfirm)=>{
    try{
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        })
        if (res.data.status === 'success') {
            showAlert('success', 'Your Account has been created successfully');
           window.setTimeout(() => {
              location.assign('/');
            }, 1000);
          }
         

    }catch(err){
        showAlert("error",err.response.data.message);
    }
 }