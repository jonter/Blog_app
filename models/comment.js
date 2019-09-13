const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        username: String // we can execute the name from id, but as we use that name quite often, we store it here    
    }
});
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;