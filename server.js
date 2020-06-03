const express = require("express");
const app = express();
const middleware = require('./middleware');
const api = require('./api');

app.use(express.json());

app.get('/',api.homeApi);
app.post('/signup',middleware.secondmiddleware,api.signupApi);
app.get('/login',api.loginApi);
app.get('/profile',api.profile);

module.exports = ({ port, cb }) => {
  app.listen(port, cb);
};




// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3001;
// const bodyparser = require('body-parser');
// const jwt = require('jsonwebtoken');
// const SECREATKEY = "quert@123";
// app.use(bodyparser.json());

// app.post('/login',(req,res)=>{
//   console.log(req.body)
//   const {username,password} = req.body

//   if(username === "farhan" && password === "code@123"){
//     const user = {
//       username,
//       age:22,
//       id:121
//     }

//     jwt.sign({user},SECREATKEY,(error,token)=>{
//       if(error){
//         res.sendStatus(403)
//       }else{
//         res.json({
//           token
//         })
//       }
//     })
    
//   }else{
//     res.sendStatus(404)
//   }
// })




// app.listen(PORT, ()=>console.log(`Your Running port on 3001`));































// const express = require('express');
// const app = express();
// const jwt = require('jsonwebtoken');
// const bodyparser = require('body-parser');

// const PORT = process.env.PORT || 3001

// app.use(express.json());
// app.use(bodyparser.json());

// app.post('/login',(req,res)=>{
//   console.log(req.body);
//   const {username,password} = req.body

//   if(username === "farhan" && password === "ali@123"){
//     res.json({
//       token:"123dhkxxl"
//     })
//   }else{
//     res.sendStatus(404);
//   }

  
// })




// app.listen(PORT,() => console.log(`Server is running on port`))