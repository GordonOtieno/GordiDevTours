import axios from 'axios'
import {showAlert} from './alert'

//type is either 'password' or 'data'
export const updateSetting = async (data,type)=>{
    try{
        const url =  type === 'password'
                                         ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
                                         :  'http://127.0.0.1:8000/api/v1/users/updateMyProfile'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `Your ${type.toUpperCase()} has been updated successfully!`);
            
          }

    }catch(err){
    showAlert("Error", err.response.data.message)
    }
}