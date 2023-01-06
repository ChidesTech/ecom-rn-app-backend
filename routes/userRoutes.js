const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();



router.get("/", async(req, res)=>{
    const userList = await User.find().select("name email");
    if(!userList){
        return res.status(500).json({success: false});
    }
    res.send(userList);
});

router.get("/:id", async(req, res)=>{
    const user = await User.findById(req.params.id).select("name email");
    if(!user){
    res.status(500).json({success:false, message: "The user wasn't found"})
    }
    res.status(200).send(user);
})


router.post("/", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin : req.body.isAdmin
        

    });
    user = await user.save();
    if (!user)
        return res.status(404).send("The user cannot be created");
    res.send(user);
});
router.post("/register", async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin : req.body.isAdmin
        

    });
    user = await user.save();
    if (!user)
        return res.status(404).send("The user cannot be created");
    res.send(user);
});

router.post("/login", async(req, res)=>{
    const user = await User.findOne({email : req.body.email});
    if(!user){
        return res.status(400).send("The user was not found.");
    }
  if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
      const token = jwt.sign(
          {
              userId : user.id,
              isAdmin : user.isAdmin
          },
          process.env.secret, 
          {
              expiresIn: "1d"
          }

      )
     res.status(200).send({user: user.email, token:token});

  }else{
      res.status(200).send("Invalid login credentials");

  }
})


module.exports = router;

