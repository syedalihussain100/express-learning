const express = require('express');

const app = express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.send({name:'zaid'})
})

app.get('/signup',(req,res)=>{
    res.send("Welcome To Singup");
})

app.post('/login',(req,res)=>{
  const {username,password} = req.body
  res.send(`your username is ${username} and password is ${password}`)  
})

app.listen(3001, () => console.log("Server is running on port 3001"));