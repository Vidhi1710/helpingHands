var mongoose=require("mongoose");


var volunteerSchema= new mongoose.Schema({
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		fullname:String
	}
});

module.exports = mongoose.model("Volunteer", volunteerSchema);