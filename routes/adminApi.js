const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/admin');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');



dotenv.config();
mongoose.connect(process.env.DBCONNECT,{useNewUrlParser:true,useUnifiedTopology:true});



//login
router.post('/login',async(req,res)=>{
    const admin=await Admin.findOne({adminname:req.body.adminname})
    if (!admin) return res.send({'message':'Incorrect adminname','st':0})
    const validPwd=await bcrypt.compare(req.body.password,admin.password);
    if (!validPwd) return res.send({'message':'Incorrect Password','st':0})

    // res.send('Login Successfull')

    const token=await jwt.sign({_id:admin._id},process.env.ATOKEN_STRING);
    res.header("admin_auth_token",token).send({message:'Welcome Admin !',token:token,admin_id:admin._id,'st':1});

});
//adminname:- Sunneth
//Password:-1234


//Register
router.post('/',async(req,res)=>{
    const adminname= req.body.adminname;
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(req.body.password,salt);
    const data= {adminname:adminname,password:hashedPassword};
    const newData=new Admin(data);
    newData.save(function(err){
        if(!err){
        res.send({'message' : 'Admin Info Saved', 'st' : 1});
            }
        else
        res.send({'message' : err, 'st' : 0});
    });

});


module.exports=router;