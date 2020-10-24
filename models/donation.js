var mongoose=require("mongoose");


var donateSchema= new mongoose.Schema({
	iname: String,
	quantity: String,
	city: String,
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		fullname:String
	},
});

module.exports = mongoose.model("Donation", donateSchema);