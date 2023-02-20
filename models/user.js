const {Schema, model} = require('mongoose');
const user = new Schema({
  email:{
    type:String,
    required:true
  },
  name:{
    type:String,
    required:true
  },
  password:{
    type:String,
    require:true
  },
  avatarUrl: String,
  cart:{
    items:[{
      count:{
        type:Number, 
        required:true,
        default:0
      },
      bookId:{
        type:Schema.Types.ObjectId,
        required:true,  
        ref:'Book'
      }
    }]
  }
},
{versionKey:false});

user.methods.addToCart = function(book){
  const cloneItems = this.cart.items.concat();
  const index = cloneItems.findIndex(b => {
    return b.bookId.toString() === book._id.toString();
  });
  if(index >= 0){
    // В корзине уже есть такая книга, увеличиваем их количество
    cloneItems[index].count = cloneItems[index].count + 1;
  }
  else{
    cloneItems.push({
      // Такой книги в корзине нет, добавляем её
      bookId:book._id,
      count:1
    });
  }
  this.cart = {items:cloneItems}
  return this.save();
}

user.methods.removeElement = function(id){
  let items = [...this.cart.items];
  const index = items.findIndex(b =>{
    return b.bookId.toString() === id.toString();
  });

  if(items[index].count === 1){
    // Удаляем книгу
    items = items.filter(b => b.bookId.toString() !== id.toString());
  }
  else{
    items[index].count--;
  }
  this.cart = {items}
  return this.save();
}

user.methods.clearCart = function(){
  this.cart = {items:[]}
  return this.save();
}

module.exports = model('User', user);