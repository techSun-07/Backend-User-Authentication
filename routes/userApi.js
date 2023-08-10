const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');
const nodemailer = require("nodemailer");
const user = require('../models/user');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const UserVerify = require('./UserVerifyToken');
const AdminVerify = require('./AdminVerifyToken');


dotenv.config();
mongoose.connect(process.env.DBCONNECT,{useNewUrlParser:true,useUnifiedTopology:true});

//All user
router.get('/', AdminVerify, (req,res)=>{
    User.find((err,data)=>{
        if(!err)
        res.send(data);
        else
        res.send(err);
    });
});

//View User profile
router.get('/:id',UserVerify, (req,res)=>{
    let id = req.params.id;
    User.findById(id,(err,data)=>{
        if(!err){
            res.send(data);
        }
        else
        res.send(err);
    });
})

//Profile Update
router.patch('/:id', UserVerify, (req,res)=>{
    let id = req.params.id;
    const username = req.body.username;
    const emailId= req.body.emailId;
    const phoneNo= req.body.phoneNo;
    const data= {username:username,emailId:emailId,phoneNo:phoneNo};
    user.findByIdAndUpdate(id,data,(err)=>{
        if(!err){
        res.send({'message' : 'Profile Updated', 'st' : 1});
            }
        else
        res.send({'message' : err, 'st' : 0});
    });
})

//Change Password
router.patch('/pwd/:id', UserVerify, async(req,res)=>{
    let id = req.params.id;
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    const data= {password:hashedPassword};
    user.findByIdAndUpdate(id,data,(err)=>{
        if(!err){
        res.send({'message' : 'Password changed Succesfully', 'st' : 1});
            }
        else
        res.send({'message' : err, 'st' : 0});
    });
})


//SignIn
router.post('/signin',async(req,res)=>{
    const user=await User.findOne({emailId:req.body.emailId})
    if (!user) return res.send({'message':'Incorrect EmailId','st':0})
    const validPwd=await bcrypt.compare(req.body.password,user.password);
    if (!validPwd) return res.send({'message':'Incorrect Password','st':0})
    // res.send('login successfull')

    const token=await jwt.sign({_id:user._id},process.env.UTOKEN_STRING);
    res.header("user_auth_token",token).send({message:'Welcome User!',token:token,user_id:user._id,'st':1});
});



//Register
router.post('/',async(req,res)=>{
    const user=await User.findOne({emailId:req.body.emailId})
  if (user) return res.send({'message': 'Email Already exist', 'st':0});

    const username = req.body.username;
    const emailId= req.body.emailId;
    const phoneNo= req.body.phoneNo;
    // const password= req.body.password;
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    const contactData={username:username, emailId:emailId};
    const data= {username:username,emailId:emailId,phoneNo:phoneNo,password:hashedPassword};
    const newData=new User(data);
    newData.save(function(err){
        if(!err){
            sendMail(contactData,info=>{
            console.log(`The mail has been sent. Id is ${info.messageId}`) });
        res.send({'message' : 'Account Created', 'st' : 1});
            }
        else
        res.send({'message' : err, 'st' : 0});
    });

});


//forget password
router.post('/forgot',async(req,res)=> {
    const user=await User.findOne({emailId:req.body.emailId})
    if (!user) return res.send({'message':'Email Address not exist','st':0})
    const code=req.body.code;
    const emailId=req.body.emailId;
    const contactData={emailId:emailId,code:code};
    fsendMail(contactData, info =>{
        console.log(`The mail has been sent Id is ${info.messageId}`)    
        res.send({'message':`An email With Verification code has been sent to  ${emailId}`,'st':1 });
        });
    
});

//reset password
router.patch('/reset/password',async(req,res)=>{
    const emailId=req.body.emailId;
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    const formdata={password:hashedPassword}
     User.findOneAndUpdate({emailId:emailId},{$set:formdata},function(err){
        if(!err)
        res.send({ 'message' : 'Password Changed Successfully','st':1});
        else
        res.send({'error' : err,'st':0});
      });
});
  



async function sendMail(contact, callback) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: "techsun428@gmail.com",
        pass: "Krishna!07"
      }
    });
  
    let mailOptions = {
      from: '"Mail from Suneeth"<suneethtaneja@gmail.com>',
      to: contact.emailId,
      subject: "Welcome to website",
      html: `<h1>Hi ${contact.username}</h1>
      <p> Your Account has been succesfully initiated. </p><br>
      <h4>Have a Good Day!!🙂 </h4>`
    };
    let info = await transporter.sendMail(mailOptions);
    callback(info);
}
async function fsendMail(contact, callback) {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, 
      auth: {
        user: "techsun428@gmail.com",
        pass: "Krishna!07"
      }
    });
  
    let mailOptions = {
      from: '"Mail from Suneeth"<techsun428@gmail.com>',
      to: contact.emailId,
      subject: "Password Recovery",
      html: `<h2>Hi </h2>  <p>You have just requested a password reset for the account associated with this email address.To reset your password
      Use the code given below .If this is a mistake just ignore this email - your password will not be changed.</p>
      <h3>Your Verification code is ${contact.code}.</h3><br>
     <h3>Regards Suneeth</h3>
`
    };
    let info = await transporter.sendMail(mailOptions);
    callback(info);
}

module.exports=router;