const express = require('express');
const SECREATKEY = "qwert@123";
const app = express();
const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001
app.use(bodyparser.json())


app.post('/login',(req,res)=>{
  const {username,password} = req.body
  console.log(req.body);
  if(username === "codes" && password === "code@123"){
    const user = {
      username,
      age:22
    }
 

    jwt.sign({user},SECREATKEY,(error,token)=>{
      if(error){
        res.sendStatus(403)
      }else{
        res.json({
          token
        })
      }
    })
  
 
  }else{
    res.sendStatus(404)
  }


})



app.listen(PORT, () => console.log(`Your Server running is Port`));









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