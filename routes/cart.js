const {Router} = require('express');
const auth = require('../middleware/auth');
const router = Router();
const Books = require('../models/book');

function mapCartItems(cart){
  return cart.items.map(b => ({...b.bookId._doc, id:b.bookId.id, count:b.count}));
}

function getCount(books){
  return books.reduce((total, book) => total += book.price * book.count, 0);
}

router.get('/', auth, async (req, res)=>{
  const user = await req.user.populate('cart.items.bookId');
  const books = mapCartItems(user.cart);
  res.render('cart', {title:'Корзина', isCart:true, books:books, price:getCount(books)});
});

router.post('/add', auth, async (req, res)=>{
  const book = await Books.findById(req.body._id);
  await req.user.addToCart(book);
  res.redirect('/cart');
});

router.delete('/remove/:id', auth, async(req, res)=>{
  await req.user.removeElement(req.params.id);
  const user = await req.user.populate('cart.items.bookId');
  const books = mapCartItems(user.cart);
  //Создаём обновлённый объект корзины и возвращаем его через json:
  const cart = {books, price: getCount(books)}
  res.status(200).json(cart);
});

module.exports = router;