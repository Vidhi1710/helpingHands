var express=require("express");
var router=express.Router();
var date = require('date-and-time');
var Blog=require("../models/blog.js");
var User=require("../models/user.js");
var middleware=require("../middleware");

router.get("/blogs",function(req,res){
	Blog.find({},function(err,all_blogs){
		if(err){
			console.log(err);
		}else{
			res.render("blogs/index",{blogs:all_blogs});
		}
	});
});

router.get("/blogs/new",middleware.isLoggedIn,function(req,res){
	res.render("blogs/new");
});

router.post("/blogs",middleware.isLoggedIn, function(req,res){
	var cname= req.body.cname;
	var image=req.body.image;
	var description=req.body.description;
	var author={
		id:req.user._id,
		fullname:req.user.fullname
	};
	var now = new Date();	
	var newBlog={
		name: cname, image: image,description:description,author:author,date:now
	}
	Blog.create(newBlog,function(err,blog){
		if(err)
			console.log(err);
		else{
			res.redirect("/blogs");
		}
	});
})

router.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id,function(err,found_blog){
		if(err)
			console.log(err);
		else
			res.render("blogs/show",{blog:found_blog});
	})
});
router.get("/blogs/:id/edit",middleware.checkBlogOwnership,function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		}
		else
			res.render("blogs/edit",{blog:foundBlog});
	})
});
router.put("/blogs/:id",middleware.checkBlogOwnership,function(req,res){
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		}
		else
			res.redirect("/blogs/"+req.params.id);
	})
});
router.delete("/blogs/:id",middleware.checkBlogOwnership,function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	})
});

module.exports=router;
