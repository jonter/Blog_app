const Post = require('../models/post');
const Comment = require('../models/comment');

const middlewareObject = {};

middlewareObject.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error', 'You have to be logged in!');
	res.redirect('/login');
}

//middleware for user permission identification (can the user manage the comment)
middlewareObject.checkCommentOwnership = function(req, res, next){
	if(!req.isAuthenticated()){
		req.flash('error', 'You have to be logged in!');
		return res.redirect('/login');
	}
	Comment.findById(req.params.id_comment, (err, foundComment) => {
		//sometimes findById doesn`t send error, but send null instead of foundComment/foundPost
		//so we get rid of the issue 
		if (err || !foundComment) {
			console.log(err);
			req.flash('error', 'Cannot find the comment');
			return res.redirect('back');
		}

		if(foundComment.author.id.equals(req.user._id)){
			next();
		}else{
			req.flash('error', 'You don`t have permissons to do that!');
			res.redirect('back');
		}		
	});
}

//another middleware for user permission identification (can the user manage the post)
middlewareObject.checkPostOwnership = function(req, res, next){
	if(!req.isAuthenticated()){
		req.flash('error', 'You have to be logged in!');
		return res.redirect('/login');
	}
	Post.findById(req.params.id, (err, foundPost) => {
		//see line 21 for explanation
		if (err || !foundPost) {
			console.log(err);
			req.flash('error', 'Cannot find the post');
			return res.redirect('back');
		}

		if(foundPost.author.id.equals(req.user._id)){
			next();
		}else{
			req.flash('error', 'You don`t have permissons to do that!');
			res.redirect('back');
		}		
	});
}

module.exports = middlewareObject;