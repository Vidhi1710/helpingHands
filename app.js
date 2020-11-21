var express=require("express");
var app=express(),
	bodyParser=require("body-parser"),
	mongoose=require("mongoose"),
	Blog=require("./models/blog"),
	Volunteer=require("./models/volunteer"),
	User=require("./models/user"),
	// Donation=require("./models/donation"),
	passport=require("passport"),
	methodOverride=require("method-override"),
	localStratergy=require("passport-local"),
	flash=require("connect-flash"),
	blogRoutes=require("./routes/blog"),
	userRoutes=require("./routes/user"),
	middleware=require("./middleware");


// var request = require("request");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
var url=process.env.DATABASEURL||"mongodb://localhost:27017/helpingHand";
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(express.static(__dirname+"/public"));

app.use(methodOverride("_method"));

app.use(flash());

app.use(require("express-session")({
	secret:"Covid help",
	resave: false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

app.use(blogRoutes);
app.use(userRoutes);

app.get("/",function(req,res){
		var b;
		var v;
		Blog.count({}, function(error, result){
			b=result; 
			Volunteer.count({}, function(er, re){
				v=re;
				// Donation.count({}, function(e, r){
				// 	d=r;
					res.render("landing",{b:b,v:v});
			})
		})
});
app.get("/volunteer",function(req,res){
	if(req.user!=null){
		User.findById(req.user._id,function(err,foundUser){
			if(err){
				req.flash("error",err.message);
				res.redirect("/volunteer");	
			}else{
				if(foundUser.registered!="false"){
					res.render("volunteer",{s:"rd"});
				}else{
					res.render("volunteer",{s:""});
				}
			}
		})
	}else{
		res.render("volunteer",{s:""});
	}
});
app.post("/volunteer",middleware.checkVolunteer,function(req,res){
	var Vbody={
		city:req.body.city
	}
	Volunteer.create(Vbody,function(err,newVolunteer){
		if(err){
			console.log(err);
		}else{
			var userUpdate={registered:true};
			User.findByIdAndUpdate(req.user._id,userUpdate,function(err,foundUser){
				if(err){
					req.flash("error",err.message)
					res.redirect("/volunteer")
				}else{
					req.flash("success","You have been successfully registered! We will try to contact you ASAP!");
					res.redirect("/volunteer");
				}
			})
		}
	})
});
app.get("/volunteer/new",middleware.checkVolunteer,function(req,res){
	res.render("nvolunteer")
});
app.get("/activity",function(req,res){
	res.send("Under development!")
});
const port = process.env.PORT || 3000
app.listen(port,function(req,res){
	console.log("Starting  web server");
})