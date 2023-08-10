const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/blog');
const multer = require('multer')
const AdminVerify = require('./AdminVerifyToken');


const DIR = './public/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});
// Multer Mime Type Validation
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});


dotenv.config();
mongoose.connect(process.env.DBCONNECT,{useNewUrlParser:true,useUnifiedTopology:true});
router.get('/',(req,res)=>{
    Blog.find((err,data)=>{
        if(!err)
        res.send(data);
        else
        res.send(err);
    }).sort({postDate: -1})
});

router.get('/recent',(req,res)=>{
    Blog.find((err,data)=>{
        if(!err)
        res.send(data);
        else
        res.send(err);
    }).limit(3).sort({postDate: -1})//-1 means decending order, this is used so that we can get the recently added 3 new data
});

router.get('/:id',(req,res)=>{
    const id = req.params.id;
    Blog.findById(id,(err,data)=>{
        if(!err)
        res.send(data);
        else
        res.send(err);
    });
});

router.delete('/:id',AdminVerify, (req,res)=>{
    const id = req.params.id;
    Blog.findByIdAndDelete(id, (err)=>{
        if(!err)
        res.send({'message' : 'Blog Deleted', 'st' : 1});
        else
        res.send({'message' : err, 'st' : 0});              
    });
});

//patch used for modification
router.patch('/data/:id',AdminVerify, (req,res)=>{
    const id = req.params.id;
    const title = req.body.title;
    const subtitle= req.body.subtitle;
    const content= req.body.content;
    const data= {title:title,subtitle:subtitle,content:content};
    Blog.findByIdAndUpdate(id, data, (err)=>{
        if(!err)
        res.send({'message' : 'Blog Updated', 'st' : 1});
        else
        res.send({'message' : err, 'st' : 0});   
    });
});


//Patch With imgUrl
router.patch('/:id',AdminVerify, upload.single('imgUrl'), (req,res)=>{
    const id = req.params.id;
    const title = req.body.title;
    const subtitle= req.body.subtitle;
    const content= req.body.content;
    const url = "http://localhost:3000/public";
    const imgUrl = url + req.file.filename;
    const data= {title:title,subtitle:subtitle,imgUrl:imgUrl,content:content};
    Blog.findByIdAndUpdate(id, data, (err)=>{
        if(!err)
        res.send({'message' : 'Blog Updated', 'st' : 1});
        else
        res.send({'message' : err, 'st' : 0});   
    });
});

router.post('/',AdminVerify, upload.single('imgUrl'), (req,res)=>{
    const title = req.body.title;
    const subtitle= req.body.subtitle;
    // const imgUrl= req.body.imgUrl;
    const url = "http://localhost:3000/public";
    const imgUrl = url + req.file.filename;
    const content= req.body.content;
    const data= {title:title,subtitle:subtitle,imgUrl:imgUrl,content:content};
    const newData=new Blog(data);
    newData.save(function(err){
        if(!err)
        res.send({'message' : 'Blog Saved', 'st' : 1});
        else
        res.send({'message' : err, 'st' : 0});
    });

});

module.exports=router;