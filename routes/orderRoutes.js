const express = require("express");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");


const router = express.Router();



router.get("/", async (req, res) => {
    const orderList = await Order.find().populate("user", "name");
    if (!orderList) {
        res.status(500).json({ success: false });
    }

    res.send(orderList);
});

router.get("/:id", async (req, res) => {
    const order = await Order.findById(req.params.id).populate("user", "name")
    .populate({path:"orderItems", populate :{path:"product", populate:"category"}});
    if (!order) {
        res.status(500).json({ success: false });
    }
    res.send(order);
});


router.post("/", async (req, res) => {

    const orderItemsId = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))

    const orderItemsIdResolved = await orderItemsId;

    const totalPrices = await Promise.all(orderItemsIdResolved.map(async orderItemId =>{
        const orderItem = await OrderItem.findById(orderItemId).populate("product", "price");
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    } ));

    const totalPrice = totalPrices.reduce((a, b) => a+b, 0)

    let order = new Order({
        orderItems: orderItemsIdResolved,
        totalPrice: totalPrice,
        user: req.body.user
    });
    order = await order.save();
    if (!order)
        return res.status(404).send("The order cannot be created");
    res.send(order);
});


router.put("/:id", async(req, res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return  res.status(500).json({ success: false, message: "Inavalid Product Id" });
      }
    const order = await Order.findOneAndUpdate(req.params.id, {
        status: req.body.status
    }, {new :true, useFindAndModify:false});
    if (!order)
        return res.status(404).send("The order cannot be updated");
    res.send(order);
});


router.delete("/:id", (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return  res.status(500).json({ success: false, message: "Invalid Order Id" });
      }
    Order.findOneAndDelete(req.params.id).then( async order => {
        if (order) {
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem);
            })
            return res.status(200).json({ success: true, message: "the order was successfully deleted" })
        } else {
            return res.status(404).json({ success: false, message: "order not found" })
        }
    }).catch(err=>{
        return res.status(400).json({ success: false, error:err })
    });

});

router.get("/get/usersorders/:id", async (req, res) => {
    const userOrderList = await Order.find({user : req.params.id}).populate("user", "name")
    .populate({path:"orderItems", populate :{path:"product", populate:"category"}});;
    if (!userOrderList) {
        res.status(500).json({ success: false });
    }

    res.send(userOrderList);
});






module.exports = router;