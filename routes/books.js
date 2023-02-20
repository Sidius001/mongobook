const {Router} = require('express');
const auth = require('../middleware/auth');
const router = Router();
const Book = require('../models/book');
const {validationResult} = require('express-validator');
const {booksValidators} = require('../utils/validators');

function isOwner(books, req){
  return books.userId.toString() !== req.user._id.toString();
}

router.get('/', async (req, res)=>{
  try{
    const books = await Book.find()
      .populate('userId', 'email name') // получаем email и name пользователя
      .select('price title image');
    res.render('books', {
      title:'Книги',
      isBooks:true, 
      userId: req.user ? req.user._id.toString() : null,
      books
    });
  }
  catch(err){console.log(`Ошибка: ${err}`)}
});

router.get('/:id/edit', auth, async(req, res)=>{
  if(!req.query.allow) return res.redirect('/');
  try{
    const books = await Book.findById(req.params.id);
    if(isOwner(books, req)){
      return res.redirect('/books');
    }
    res.render('books-edit', {title:`Редактировать ${books.title}`, isBooksSingle:true, books});
  }
  catch(err){console.log(err)}
});

router.get('/:id', auth, async (req, res)=>{
  try{
    const book = await Book.findById(req.params._id);
    res.render('books', {layout:'single-book', title:`Книга ${book.title}`, isBooksSingle:true, book});
  }
  catch(err){console.log(err)}
});

router.post('/edit', booksValidators, async(req, res)=>{
  try{
    const errors = validationResult(req);
    const id = req.body._id;
    const books = await Book.findById(id);
    if(!errors.isEmpty()){  
      return res.status(422).redirect(`/books/${id}/edit?allow=true`);
    }
    if(isOwner(books, req)){
      return res.redirect('/books');
    }
    await Book.findByIdAndUpdate(id, {
      $set:{title:req.body.title, price:req.body.price, image:req.body.image}
    });
    res.redirect('/books');
  }
  catch(err){console.log(err)}
});

router.post('/remove', auth, async(req, res)=>{
  try{
    await Book.deleteOne({
      _id:req.body._id,
      userId: req.user._id
    });
    res.redirect('/books');
  }
  catch(err){console.log(err)}
});

module.exports = router;