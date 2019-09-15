const express = require('express');
const router = express.Router({mergeParams:true});//this option need to let our router recieve and use ':id_post' normally
const Post = require('../models/post');
const Comment = require('../models/comment');
//index.js is a special name so when you require a folder it automatically points to that file
const middleware = require('../middleware');

//COMMENT ROUTES
router.get('/new', middleware.isLoggedIn, (req, res) => {
	Post.findById(req.params.id_post, (err, foundPost) => {
		if (err) {
			res.redirect('/posts' + req.params.id_post);
			return;
		}
		res.render('comments/new', { post: foundPost });
	});
});

router.post('/', middleware.isLoggedIn, (req,res)=>{
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

//EDIT ROUTE
router.get('/:id_comment/edit', middleware.checkCommentOwnership, (req, res)=>{
	Post.findById(req.params.id_post, (err,foundPost)=>{
		if(err){
			return res.redirect('back');
		}

		Comment.findById(req.params.id_comment, (err, foundComment)=>{
			if(err){
				return res.redirect('back');
			}
			res.render('comments/edit',{post: foundPost, comment: foundComment	});
		});
	})
});

//UPDATE ROUTE
router.put('/:id_comment', middleware.checkCommentOwnership, (req,res)=>{
	Comment.findByIdAndUpdate(req.params.id_comment, req.body.comment , (err, updatedComment)=>{
		if(err){
		    return	res.redirect('back');
		}
		res.redirect('/posts/'+req.params.id_post);
	});
});

//DESTROY ROUTE
router.delete('/:id_comment', middleware.checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndRemove(req.params.id_comment, (err)=>{
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		//send a message that we have succesfully removed a comment
		res.redirect('/posts/'+req.params. id_post);
	});
});

module.exports= router;