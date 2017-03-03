var mongoose = require('mongoose');

var workSchema = mongoose.Schema({
	title : String,
	type : Number,
	details: String,
	UID : String
})

module.exports = mongoose.model('Work', workSchema);