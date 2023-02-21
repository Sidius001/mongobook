const express = require('express');
const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
require('dotenv').config({path:"./keys/index"});
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const exp_hbs = require('express-handlebars');
const session = require('express-session');
const MongoSS = require('connect-mongodb-session')(session);
const Handlebars = require('handlebars');
const app = express();
const homeRoute = require('./routes/home');
const booksRoute = require('./routes/books');
const booksAdd = require('./routes/add');
const cartRoute = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const fileMid = require('./middleware/file');
const errorURL = require('./middleware/error');
const keys = require('./keys');
const sessionsMid = require('./middleware/sessions');
const userMid = require('./middleware/user');


//server connect:

const PORT = process.env.port;


async function start(){
  try{
    await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser:true, dbName:'IBook'});
    mongoose.set('strictQuery', false);    
    app.listen(PORT, HOST, ()=>{
      console.log(`Server running on port: ${PORT}`);
    });
  }
  catch(err){
    console.log(`Ошибка: ${err}`);
  }
}

start();

app.use(express.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/user-imgs', express.static(path.join(__dirname, 'user-imgs')));
//connect handlebars
const hbs = exp_hbs.create({
  defaultLayout:'main',
  extname:'hbs',
  handlebars:allowInsecurePrototypeAccess(Handlebars),
  helpers: require('./utils/hbs-helpers')
});

const store = new MongoSS({
  collection:'sessions',
  uri: keys.MONGODB_URI
});

app.use(session({
    secret:keys.SESSION_SECRET,
    resave: false,
    saveUnitialized: false,
    store:store
  })
);
app.use(fileMid.single('avatar'));
app.use(csurf());
app.use(flash());
// app.use(helmet());
app.use(compression());
app.use(sessionsMid);
app.use(userMid);

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use('/', homeRoute);
app.use('/books', booksRoute);
app.use('/add', booksAdd);
app.use('/cart', cartRoute);
app.use('/orders', ordersRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use(errorURL);
