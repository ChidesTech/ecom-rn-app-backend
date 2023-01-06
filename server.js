const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const authJwt = require("./middlewares/jwt");
const errorHandler = require("./middlewares/error-handler");



const app = express();
app.use(cors());
app.options("*", cors());

require('dotenv/config');

const api = process.env.API_URL;

app.use(express.json());
app.use(authJwt());
app.use(errorHandler);
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));


app.use(`${api}/products`, productRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/categories`, categoryRoutes);
app.use(`${api}/orders`, orderRoutes);


app.get("/", (req,res)=>{
    res.send("Hello from ecom app");
    
});


const MongoDBUri = process.env.DB_URL;


mongoose.connect(MongoDBUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }).then(result => {
      console.log("MongoDB is connected")
   }).catch(err => console.log(err))
  

app.listen(3000, (req, res)=>{
    console.log("Listening on port 3000 at http://localhost:3000");
})

