var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
  local: {
    username: 
    {
    	type : String,
    	required : true,
    	unique : true
    },
    password: 
    {
    	type : String,
    	required : true
    },
    
  },
  portfolio: {type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio'}
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
