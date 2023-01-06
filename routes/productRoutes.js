const express = require("express");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();


const FILE_TYPE_MAP ={
    "image/png" :"png",
    "image/jpg" :"jpg",
    "image/jpeg" :"jpeg",
};



var storage = multer.diskStorage({
    destination : function(req, file, cb){
        const isAllowed = FILE_TYPE_MAP[file.mimetype];
        
        let uploadError = new Error("Invalid image type");
        if(isAllowed){
            uploadError = null
        }
        cb(uploadError, "public/uploads")
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random()* IE9); 
        cb(null, file.originalname.split(" ").join("-") + "-" + uniqueSuffix +  extension);
    }
});

const uploadOptions = multer({storage : storage});


router.get(`/`, async (req, res) => {
    let filter = {};
    if(req.query.categories){
        filter = {category : req.query.categories.split(",")};
    }
    const productList = await Product.find(filter).populate("category");

    if (!productList) {
        return res.status(404).json({ success: false });

    }
    res.send(productList);

});
router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
        return res.status(404).json({ success: false, message: "Product was not found" });
    }
    res.send(product);

});

router.post("/", uploadOptions.single("image"), async (req, res) => {

    const category = await Category.findById(req.body.category);

    if (!category) return res.status(400).send("Invalid Category");
    const file = req.file;
    if (!file) return res.status(400).send("No image selected");



    const fileName =  req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        image: `${basePath}${fileName}`,
        description: req.body.description,
        richDescription: req.body.richDescription,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    if (!product)
        return res.status(500).send("Error In Creating Product")

    res.send(product);


});

router.put("/:id", uploadOptions.single("image"), async (req, res) => {
    
    if(!mongoose.isValidObjectId(req.params.id)){
      return  res.status(500).json({ success: false, message: "Inavalid Product Id" });
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send("Invalid product");
    const file = req.file;
    let imagePath;

    if(file){
        const fileName =  req.file.filename;
        const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;

    }else{
        imagePath = product.image;

    }

    if (product) {
        product.name = req.body.name ;
        product.image = imagePath;
        product.description = req.body.description;
        product.richDescription = req.body.richDescription;
        product.brand = req.body.brand;
        product.price = req.body.price;
        product.category = req.body.category;
        product.countInStock = req.body.countInStock;
        product.rating = req.body.rating;
        product.numReviews = req.body.numReviews;
        product.isFeatured = req.body.isFeatured;

        newProduct = await product.save();
        if (newProduct) {
            res.status(200).send({ product: newProduct });

        } else {
            res.status(200).send({ product: newProduct });

        }

    } else {
        res.status(500).json({ success: false, message: "The Product was not found" });

    }


});

router.delete("/:id", (req, res) => {
    if(!mongoose.isValidObjectId(req.params.id)){
        return  res.status(500).json({ success: false, message: "Inavalid Product Id" });
      }
    Product.findOneAndDelete(req.params.id).then(product => {
        if (product) {
            return res.status(200).json({ success: true, message: "the product was successfully deleted" })
        } else {
            return res.status(404).json({ success: false, message: "product not found" })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
        ;

});


router.get("/get/featured/:count", async (req, res) => {
    const count = req.params.count ?req.params.count : 0;
    const products= await Product.find({isFeatured: true}).limit(+count);
    if (!products) {
        res.status(500).json({ success: false });
    };
    res.send(products);
});


module.exports = router;
