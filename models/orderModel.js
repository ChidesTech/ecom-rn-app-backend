const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    orderItems:  [
    {type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' },
    ],
    
   totalPrce: {
       type: Number
   },
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' , default:""},

   dateOrdered :{
       type: Date, default: Date.now
   }
},{timestamps: true}
);
 
orderSchema.virtual("id").get(function(){
    return this._id.toHexString();
});

orderSchema.set("toJSON", {
    virtuals: true
});
const Order  = mongoose.model("Order", orderSchema);

module.exports = Order 




