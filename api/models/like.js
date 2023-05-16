const mongoose = require('mongoose');

const likeSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Like', likeSchema);