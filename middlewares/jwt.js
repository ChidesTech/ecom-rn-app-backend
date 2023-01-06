const expressJWt = require("express-jwt");

function authJwt(){
    const secret = process.env.secret;
    return expressJWt({
        secret,
        algorithms: ["HS256"],
        isRevoked: isRevoked
    }).unless({
        path:[
            {url : /\/public\/uploads(.*)/, method: ["GET", "OPTIONS"]},
            {url : /\/api\/products(.*)/, method: ["GET", "OPTIONS"]},
            {url : /\/api\/categories(.*)/, method: ["GET", "OPTIONS"]},
            "/api/users/login",
            "/api/users/register",
        ]
    })
}



async function isRevoked(req, payload, done){
    if(!payload.isAdmin){
        done(null, true)
    }
    done();
}

module.exports  = authJwt;

