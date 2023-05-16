const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId, //dexete veltiwsh me auto increment
    username: {type: String , required:true, unique:true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    vinyls:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vinyl'
    }]
});


module.exports = mongoose.model('User', userSchema);