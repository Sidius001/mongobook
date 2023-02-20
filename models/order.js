const {Schema, model} = require('mongoose');
const order = new Schema({
  books:[{
    book:{type:Object, required:true},
    count:{type:Number, required:true}
  }],
  user:{
    name:String,
    userId:{
      type:Schema.Types.ObjectId, 
      ref: 'User', required:true
    }
  },
  date:{
    type:Date,
    default:Date.now
  }
}, 
{versionKey:false});

module.exports = model('Order', order);