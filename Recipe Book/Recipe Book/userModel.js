const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // only hash if password is modified
    const salt = await bcrypt.genSalt(10); // generate a salt
    this.password = await bcrypt.hash(this.password, salt); // hash password
    next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
