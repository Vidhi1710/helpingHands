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
	userRoutes=require("./routes/user");


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
		// Blog.count( {}, function(error, result){
		// console.log(result)      
		// })
		res.render("landing",{total:total,death:death,today:today});
	});	
});
app.get("/volunteer",function(req,res){
	res.render("volunteer")
});
app.get("/donate",function(req,res){
	res.render("donate")
});
app.listen(3000,function(req,res){
	console.log("Starting  web server");
})