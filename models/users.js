const mongoose = require('../db');

const usersSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    userId: { type: String, required: true },
    price: { type: Number, required: true },
});

let userModel = mongoose.model('users', usersSchema)

module.exports = mongoose.model('Users', userModel);
