const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now },
	author: {
        id: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        username: String // we can execute the name from id, but as we use that name quite often, we store it here    
    },
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
});
const Post = mongoose.model('Post', postSchema);

module.exports = Post;