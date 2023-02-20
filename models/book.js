const {Schema, model} = require('mongoose');
const book = new Schema({
  title:{
    type: String,
    required: true
  },
  price:{
    type: Number, 
    required: true
  },
  image: String,
  userId:{
    type:Schema.Types.ObjectId,
    ref:'User'
  }
},
{versionKey:false});

book.method('toClient', function(){
  const oneBook = this.toObject();
  oneBook.id = oneBook._id;
  delete oneBook._id;
  return oneBook;
});


module.exports = model('Book', book);