const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: { type:String, unique:true },
    email: String,
    isVerified:{ type:Boolean, default: false },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    roles: [{type: String}]
});
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'// now authorization by email field
});

module.exports = mongoose.model('User', userSchema);






