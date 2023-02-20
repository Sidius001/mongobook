const {Router} = require('express');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const emails = require('../emails/reg');
const {validationResult} = require('express-validator');
const {regValidators} = require('../utils/validators');
const router = Router();

router.get('/login', async (req, res)=>{
  res.render('auth/login', 
    {
      title:'Авторизация', 
      isLogin: true, 
      error: req.flash('err'),
      errLogin:req.flash('err-login')
    }
  );
});

router.get('/logout', async (req, res)=>{
  req.session.destroy(()=>{
    res.redirect('/');
    //или: res.redirect('/auth/login#login');
  });
});

router.post('/login', async (req, res)=>{
  try{
    const {email, password} = req.body;
    const visitor = await User.findOne({email});
    if(visitor){
      //Проверяем пароли на совпадение:
      const isSame = await bcrypt.compare(password, visitor.password);
      if(isSame){
        req.session.user = visitor;
        req.session.isAuthenticated = true;
        req.session.save(err => {
          if(err) throw err;
          res.redirect('/');
        });
      }
      else{
        req.flash('err-login', 'Пароль неправильный');
        res.redirect('/auth/login#login');
      }
    }
    else{	
      req.flash('err-login', 'Такого пользователя не существует');
      res.redirect('/auth/login#login'); 
    }
  }
  catch(err){console.log(`Ошибка: ${err}`)}
});


router.post('/register', regValidators, async (req, res)=>{
  try{
    const {name, email, password, confirm} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      req.flash('err', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }
    const hashPass = await bcrypt.hash(password, 10);
    const user = new User({
      email, name, password: hashPass, cart:{items:[]}
    });
    await user.save();
    res.redirect('/auth/login#login');
    await emails(email);
  }
  catch(err){console.log(`Ошибка: ${err}`)}
});

module.exports = router;
