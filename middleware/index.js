var middlewareObj={},
	Blog=require("../models/blog");
middlewareObj.checkBlogOwnership=function (req,res,next){
	if(req.isAuthenticated()){
		Blog.findById(req.params.id,function(err,foundBlog){
			if(err){
				req.flash("error","Blog not found");
				res.redirect("back");
			}else{
				if(foundBlog.author.id.equals(req.user._id)){
					next();
				}else{
					req.flash("error","You need to be logged in to do that");
					res.redirect("back");
				}
			}
		})
	}else{
		req.flash("error","You need to be logged in to do that");
		res.redirect("back");
	}
}
middlewareObj.checkVolunteer=function (req,res,next){
	if(req.isAuthenticated()){
		User.findById(req.params.id,function(err,foundUser){
			if(err){
				req.flash("error","User not found");
				res.redirect("back");
			}else{
				if(foundUser.registered.equals("false")){
					next();
				}else{
					req.flash("error","You are already registered!");
					res.redirect("/volunteer");
				}
			}
		})
	}else{
		req.flash("error","You need to be logged in to do that");
		res.redirect("back");
	}
}
middlewareObj.isLoggedIn = function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in to do that");
	res.redirect("/login");
}

module.exports=middlewareObj;