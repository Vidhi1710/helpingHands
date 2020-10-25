var express=require("express");
var app=express(),
	bodyParser=require("body-parser"),
	mongoose=require("mongoose"),
	Blog=require("./models/blog"),
	Volunteer=require("./models/volunteer"),
	User=require("./models/user"),
	Donation=require("./models/donation"),
	passport=require("passport"),
	methodOverride=require("method-override"),
	localStratergy=require("passport-local"),
	flash=require("connect-flash"),
	blogRoutes=require("./routes/blog"),
	userRoutes=require("./routes/user"),
	middleware=require("./middleware");


var request = require("request");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
var url=process.env.DATABASEURL||"mongodb://localhost:27017/covid";
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
	request({
	  uri: "https://www.ndtv.com/coronavirus/india-covid-19-tracker",
	}, function(error, response, body) {
	  	var s1=body.split('<div class="total-data-list confirmed"><span class="ind-mp_num">')[2];
		var total=s1.split('<span')[0];
		var s2=body.split('<div class="total-data-list activecase"><span class="ind-mp_num">')[2];
		var today=s2.split('<span')[0];
		var s3=body.split('<div class="total-data-list deaths"><span class="ind-mp_num">')[2];
		var death=s3.split('<span')[0];
		var b;
		var v;
		var d;
		Blog.count({}, function(error, result){
			b=result; 
			Volunteer.count({}, function(er, re){
				v=re;
				Donation.count({}, function(e, r){
					d=r;
					res.render("landing",{total:total,death:death,today:today,b:b,v:v,d:d});
				})
			})
		})
	});	
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
app.get("/donate",function(req,res){
	Donation.find({},function(err,allDonations){
		if(err){
			console.log(err);
			res.redirect("back")
		}else{
			res.render("donate",{donations:allDonations})
		}
	})
});
app.get("/donate/new",middleware.isLoggedIn,function(req,res){
	res.render("mdonation")
});
app.get("/donate/request",middleware.isLoggedIn,function(req,res){
	res.render("rdonation")
});
app.post("/donate",middleware.isLoggedIn,function(req,res){
	Donation.create(req.body.donate,function(err,newDonation){
		if(err){
			req.flash("error",err.message);
			res.redirect("/donate");
		}else{
			newDonation.author.id=req.user._id;
			newDonation.author.fullname=req.user.fullname;
			newDonation.save();
			req.flash("success","Thanks for making a change by doanting! We will contact you ASAP!");
			res.redirect("/donate");
		}
	})
});
app.post("/donate/request",function(req,res){
	req.flash("success","Your request has been submitted. We will try to reach you ASAP!");
	res.redirect("/donate");
})

const port = process.env.PORT || 3000
app.listen(port,function(req,res){
	console.log("Starting  web server");
})