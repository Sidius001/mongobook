const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const keys = require('../keys');

const oAuth2Client = new google.auth.OAuth2(keys.GMAIL_CLIENT_ID, keys.GMAIL_CLIENT_SECRET, keys.GMAIL_REDIRECT_URI);

oAuth2Client.setCredentials({refresh_token:keys.GMAIL_REFRESH_TOKEN});

async function sendMail(email){
  try{
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service:'gmail',
      auth:{
        type:'OAuth2',
        user:'unixmix1@gmail.com',
        clientId:keys.GMAIL_CLIENT_ID,
        clientSecret:keys.GMAIL_CLIENT_SECRET,
        refreshToken:keys.GMAIL_REFRESH_TOKEN,
        accessToken
      }
    });

    const mailOptions = {
      from:`BookStore <${keys.EMAIL_FROM}>`,
      to:email,
      subject:'Регистрация',
      text:'Регистрация прошла успешно',
      html:`
        <div style="text-align:center">
          <h1 style="color:red; text-align:center">
            Вас приветствует интернет-магазин Book SHOP!
            <img src="https://i.ibb.co/MZRpLSr/bookshop.jpg">
            <hr>
            <a href="${keys.BASE_URL}" style="font-size:20px">Перейти в магазин</a>
          </h1>
        </div>`
    }
    const result = await transport.sendMail(mailOptions);
    console.log("IT WORKS!");
    return result;
  }
  catch(err){return err;}
}

module.exports = function(email){
  sendMail(email);
}