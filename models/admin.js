const mongoose = require('mongoose');

const adminSchema=new mongoose.Schema({
    adminname:{type:String,required:[true,"Admin Name Required *"]},  
    password:{type:String,required:[true,"Password is Required"]},
});

module.exports=mongoose.model("admin",adminSchema,"admin")