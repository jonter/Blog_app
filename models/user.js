const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email:{ type: String, unique: true },
    isVerified:{ type:Boolean, default: false },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date
});
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);






