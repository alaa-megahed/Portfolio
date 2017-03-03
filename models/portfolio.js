var mongoose = require('mongoose');


var portfolioSchema = mongoose.Schema({
    name: 
    {
    	type : String,
    	required : true,
    },
    works: [{type: mongoose.Schema.Types.ObjectId, ref: 'Work'}],
    UID : String,
    description : String,
    profilePicture: {type: String, default: "images/userpp.png"}
});



module.exports = mongoose.model('Portfolio', portfolioSchema);
