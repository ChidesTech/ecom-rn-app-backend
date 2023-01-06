const errorHandler = (err, req, res, next)=>{
    if(err.name === "UnauthorizedError"){
        return res.status(401).json({message: "The User Is Not Authorized"})
    }
    if(err.name === "ValidationError"){
       return res.status(401).json({message: err})
    }
   res.status(500).json({message: err})

}


module.exports = errorHandler;