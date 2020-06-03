const firstmiddleware = (req,res,next)=>{
console.log("first middleware was called");
next();
}

const secondmiddleware = (req,res,next)=>{
    console.log("first middleware was called");
    req.uniqueId = Math.random(Math.random(1) * 1000 );
    next();
};

module.exports = {
    firstmiddleware,
    secondmiddleware
}