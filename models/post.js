const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now },
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref: 'Comment'
		}
	]
});
const Post = mongoose.model('Post', postSchema);

module.exports = Post;