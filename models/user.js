let mongoose = require('mongoose');
let Schema = mongoose.Schema;

userSchema = new Schema( {
    username: String,
    password: String,
    passwordConf: String,
    score: Number
}),
    User = mongoose.model('User', userSchema);

module.exports = User;
