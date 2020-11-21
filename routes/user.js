var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var middleware=require("../middleware");

router.get("/register",function(req,res){
	res.render("register");
});
router.post("/register",function(req,res){
	var newUser=new User({username:req.body.username,fullname:req.body.fullname});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			console.log(err);
			req.flash("error",err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome to HelpingHands "+user.fullname)
			res.redirect("/");
		});
	});
});

router.get("/login",function(req,res){
	res.render("login");
}) 
router.post("/login",passport.authenticate("local",{
	successRedirect:"/",
	failureRedirect:"/login",
	failureFlash: true
}),function(req,res){
	
});

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","Logged you out!");
	res.redirect("/");
});
module.exports=router;