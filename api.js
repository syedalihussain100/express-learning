const homeApi = (req,res) =>{
    res.send("This is home");
}

const signupApi = (req,res)=>{
    const {firstname,lastname} = req.body
    console.log(`this unique id is`,req.uniqueId);
    res.send(`This is signup My name is ${firstname} and my last name is ${lastname}`);
}

const loginApi = (req,res)=>{
    res.send("This is login");
}

const profile = (req,res) =>{
    res.send("This is a Profile");
}
module.exports={
homeApi,
signupApi,
loginApi,
profile
}