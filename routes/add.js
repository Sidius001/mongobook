const {Router} = require('express');
const auth = require('../middleware/auth');
const {validationResult} = require('express-validator');
const {booksValidators} = require('../utils/validators');
const router = Router();
const Book = require('../models/book');

router.get('/', auth, (req, res)=>{
  res.render('add', {title:'Добавить книгу', isAdd:true});
});

router.post('/', auth, booksValidators, async (req, res)=>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render('add', {
      title:'Добавить книгу',
      isAdd:true,
      error:errors.array()[0].msg,
      data:{
        title:req.body.title,
        price:req.body.price,
        image:req.body.image
      }
    });
  }
  const book = new Book({
    title:req.body.title, 
    price:req.body.price, 
    image:req.body.image,
    userId:req.session.user._id
  });
  try{
    await book.save();
    res.redirect('/books');
  }
  catch(err){console.log(err);}
});

module.exports = router;