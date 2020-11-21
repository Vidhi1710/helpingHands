var mongoose=require("mongoose");


var blogSchema= new mongoose.Schema({
	name: String,
	image: String,
	description: {
		type:String,
		default:""
	},
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		fullname:String
	},
	date: Date
});

module.exports = mongoose.model("Blog", blogSchema);