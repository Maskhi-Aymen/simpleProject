import express from 'express'
import Blogs from '../models/blogModel.js';
import path from 'path';
import User from '../models/userModel.js';
import fs from 'fs';
import multer from'multer';




const storage = multer.diskStorage({
    destination: function (req,file,cb){
      cb(null,'./uploads/');
    },
    filename:function(req,file,cb){ 
      cb(null,file.originalname)
    }
});
const fileFiltre =(req,file,cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'){
        cb(null,true);
    }else{
        cb(null,false)
    }
}
const upload=multer({storage:storage,fileFilter:fileFiltre});

const blogRouter = express.Router();

blogRouter.get('/getall', async (req, res) => {
    const blog = await Blogs.find();
    res.send(blog);
});
blogRouter.post('/add/:userId',upload.single('img') , async (req, res) => {
    const user = await User.findById({ _id:req.params.userId});
    if (user) {
        if(user.admin){
    try{
    const newBlog  = new Blogs({
        title: req.body.title, 
        author: req.body.author,
        date: req.body.date,
        time: req.body.time,
        imgUrl: req.body.imgUrl,
        description:req.body.description,
        quote:req.body.quote,
    });
    const blog = await newBlog.save();
    res.send({
        message: "success",
    })
    
}catch (error) {
    res.send({
        message: error,
    })}
}}
else {
    res.status(404).send({message: 'Pas d acces'});
}
});


blogRouter.put('/:userId/:blogId',upload.single('img') ,async (req, res) => {
    const user = await User.findById({ _id:req.params.userId});
    if (user) {
        if(user.admin){
    const blog = await Blogs.findByIdAndUpdate({_id:req.params.blogId},req.body);
    if(blog) {
       
    res.send({
        message: "update succes",
    })
    } else {
        res.status(404).send({message: 'Blog Not Found'}); 
    }
}}
else {
    res.status(404).send({message: 'Pas d acces'});
}   
 });

//get blog by id
blogRouter.get('/:blogId', async (req, res) => { 
    const blog = await Blogs.findById({_id:req.params.blogId});
    if(blog) { 
        res.send(blog)
    } else {
        res.status(404).send({message: 'blog Not Found'});
    }
    
});
blogRouter.delete('/comment/:userId/:blogId/:commentId', async (req, res) => {
    const user = await User.findById({ _id:req.params.userId});
    if (user) {
        if(user.admin){
    const blog = await Blogs.findById({_id:req.params.blogId});   
    const commentId  =req.params.commentId;
    if(blog) {
    const comment = blog.comments.filter(function(x){if(x._id!=commentId) return x;})
    const blog2 = await Blogs.findByIdAndUpdate({_id:req.params.blogId},{comments:comment});
    res.send(blog2)
    } else {
        res.status(404).send({message: 'Blog Not Found'}); 
    }}}
    else {
        res.status(404).send({message: 'Pas d acces'});
    }
});

blogRouter.post('/comment/:blogId', async (req, res) => {
    const blog = await Blogs.findById({_id:req.params.blogId});   
    const comment  =({
        c_user: req.body.user,
        c_date: req.body.date,
        c_comment: req.body.comment
    });
    if(blog) {
    blog.comments.push(comment);
    blog.save();
    res.send(req.body)
    } else {
        res.status(404).send({message: 'Blog Not Found'}); 
    }
});

blogRouter.delete('/:userId/:blogId', async (req, res) => {
    const user = await User.findById({ _id:req.params.userId});
    if (user) {
        if(user.admin){
    const cdd = await Blogs.findById({_id:req.params.blogId});
    if(cdd) { 
    const img=cdd['imgUrl'].substring(30)
    if (img) {
        const oldPath = path.join("uploads", img);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      }
    const blog = await Blogs.deleteOne({_id:req.params.blogId});
    
        res.send({
            message: "delete succes"
        })
    } else {
        res.status(404).send({message: 'Blog Not Found'});
    }
}}else {
    res.status(404).send({message: 'Pas d acces'});
}
});





export default blogRouter;