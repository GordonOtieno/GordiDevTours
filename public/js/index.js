//*eslint-disable */

import '@babel/polyfill'
import { login,logout } from './login'
import { signup } from './signup'
import { displayMap } from './mapbox'
import { updateSetting } from './updateSettings'
import { bookTour } from './stripe'

//DOM ELEMENT
const mapBox = document.getElementById('map')
const  loginForm = document.querySelector('.form--login')
const signUpForm = document.querySelector('.form--signup')
const logoutBtn=document.querySelector('.nav__el--logout')
const userdata=document.querySelector('.form-user-data')
const userpassword= document.querySelector('.form-user-password')
const bookBtn= document.getElementById('book-tour')

//DELIGATION
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
    //console.log(locations)
}

if (signUpForm)
signUpForm.addEventListener('submit', e =>{
  e.preventDefault()
  const name=document.getElementById('name').value
  const email=document.getElementById('email').value
  const password=document.getElementById('password').value
  const passwordConfirm=document.getElementById('passconfirm').value
  signup(name,email,password,passwordConfirm)
 
})

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

  if(logoutBtn) logoutBtn.addEventListener('click',logout)

  if(userdata)
  userdata.addEventListener('submit', e =>{
      e.preventDefault()
      const form =new FormData()
      form.append('name', document.getElementById('name').value)
      form.append('email', document.getElementById('email').value)
      form.append('photo', document.getElementById('photo').files[0])
      console.log(form)
      updateSetting(form, 'data')
    
    })
  
  if(userpassword)
  userpassword.addEventListener('submit',async e =>{
  e.preventDefault()
  document.querySelector('.btn-save-password').textContent='Updating...'
    const passwordCurrent = document.getElementById('password-current').value
    const password = document.getElementById('password').value
    const passwordConfirm = document.getElementById('password-confirm').value
    
   await updateSetting({passwordCurrent,password,passwordConfirm}, 'password')
   document.querySelector('.btn-save-password').textContent='Save Password'
   document.getElementById('password-current').value=""
   document.getElementById('password').value=""
   document.getElementById('password-confirm').value=""

  })
  
  if(bookBtn)
  bookBtn.addEventListener('click', async e=>{
    e.preventDefault()
    e.target.textContent = 'Processing...'
    //const tourId = e.target.dataset.tourId
    const { tourId } = e.target.dataset
    bookTour(tourId)
  })