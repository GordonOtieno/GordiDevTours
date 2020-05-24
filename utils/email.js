const nodemailer=require('nodemailer')
const htmlToText = require('html-to-text') 
const pug = require('pug')

module.exports = class Email{
  constructor (user, url){
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this. from = `Gordon Otieno <${process.env.EMAIL_FROM}>`
  }

  newTransport(){
    if (process.env.NODE_ENV === 'production'){
      //sendgrid
      return  nodemailer.createTransport({
        service: 'sendGrid',
        auth:{
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRIDE_PASSWORD
        }
      })
    }
    //create a transporter
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port:process.env.EMAIL_PORT,
      auth:{
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
      }
   })

  }
  //send actual email
 async send(template, subject){

  //1. Render html based on pug templates
  const html= pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
    firstName: this.firstName,
    url: this.url,
    subject
  })
  
  //2. Define email options
  const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html,
    // stripping off html formats install html text
    text: htmlToText.fromString(html)
  }

  //3. create transport and send email
  await  this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome(){
   await this.send('welcome', 'Welcome to gordiTour. The only place to get the oportunity to explore your World')
  }
async sendPasswordReset(){
  await this.send('passwordReset', 'Your password reset token is valid for 10 minites ')
}

}

