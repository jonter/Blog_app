const express = require('express');
const router = express.Router({mergeParams:true});//this option need to let our router recieve and use ':id_post' normally
const Post = require('../models/post');
const Comment = require('../models/comment');

//COMMENT ROUTES
router.get('/new',isLoggedIn, (req, res) => {
	Post.findById(req.params.id_post, (err, foundPost) => {
		if (err) {
			res.redirect('/posts' + req.params.id_post);
			return;
		}
		res.render('comments/new', { post: foundPost });
	});
});

router.post('/',isLoggedIn, (req,res)=>{
	//find post, create comment, add comment to the post, save updated post
	Post.findById(req.params.id_post, (err, foundPost)=>{
		if (err) {
			console.log(err);
			res.redirect('/posts' + req.params.id_post);
			return;
		}
		Comment.create(req.body.comment, (err, newComment)=>{
			if (err) {
				console.log(err);
				res.redirect('/posts/' + req.params.id_post);
				return;
			}
			//and username and id to the comment
			newComment.author.id = req.user._id;
			newComment.author.username = req.user.username;
			//save comment
			newComment.save();
			//add comment to the post
			foundPost.comments.push(newComment);
			foundPost.save();
			res.redirect('/posts/' + req.params.id_post);
		});

	});
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}


module.exports= router;