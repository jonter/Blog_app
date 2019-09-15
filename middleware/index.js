const Post = require('../models/post');
const Comment = require('../models/comment');

const middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

//middleware for user permission identification (can the user manage the comment)
middlewareObject.checkCommentOwnership = function(req, res, next){
	if(!req.isAuthenticated()){
		return res.redirect('/login');
	}
	Comment.findById(req.params.id_comment, (err, foundComment) => {
		if (err) {
			console.log(err);
			return res.redirect('back');
		}

		if(foundComment.author.id.equals(req.user._id)){
			next();
		}else{
			res.redirect('back');
		}		
	});
}

//another middleware for user permission identification (can the user manage the post)
middlewareObject.checkPostOwnership = function(req, res, next){
	if(!req.isAuthenticated()){
		return res.redirect('/login');
	}
	Post.findById(req.params.id, (err, foundPost) => {
		if (err) {
			console.log(err);
			return res.redirect('back');
		}

		if(foundPost.author.id.equals(req.user._id)){
			next();
		}else{
			res.redirect('back');
		}		
	});
}

module.exports = middlewareObject;