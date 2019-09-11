const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});
const Post = mongoose.model('Blog', postSchema);

module.exports = Post;