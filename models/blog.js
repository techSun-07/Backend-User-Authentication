const mongoose = require('mongoose');

const blogSchema=new mongoose.Schema({
    title:{type:String,required:[true,"Article Title Required *"]},
    subtitle:{type:String,required:[true,"Article SubTitle is Required *"]},
    imgUrl:{type:String, required:[true, "Image is Required *"]},
    content:{type:String,maxlength:[10000,"Max Char limits Exceeds"]},
    postDate:{type:Date,default:Date.now}

});

module.exports=mongoose.model("blog",blogSchema,"blog")