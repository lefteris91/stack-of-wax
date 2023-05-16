const mongoose = require('mongoose');


const vinylSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, 
    title: { type: String, required: true, unique: true },
    musicGenre: { type: String, required: true },
    artist: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ 
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        comment: { type: String, required: true }
    }]
});


module.exports = mongoose.model('Vinyl', vinylSchema);
