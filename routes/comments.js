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

//EDIT ROUTE
router.get('/:id_comment/edit', checkCommentOwnership, (req, res)=>{
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
router.put('/:id_comment', checkCommentOwnership, (req,res)=>{
	Comment.findByIdAndUpdate(req.params.id_comment, req.body.comment , (err, updatedComment)=>{
		if(err){
		    return	res.redirect('back');
		}
		res.redirect('/posts/'+req.params.id_post);
	});
});

//DESTROY ROUTE
router.delete('/:id_comment',checkCommentOwnership,(req,res)=>{
	Comment.findByIdAndRemove(req.params.id_comment, (err)=>{
		if(err){
			console.log(err);
			return res.redirect('back');
		}
		//send a message that we have succesfully removed a comment
		res.redirect('/posts/'+req.params. id_post);
	});
});

//another middleware for user permission identification (can the user manage the comment)
function checkCommentOwnership(req, res, next){
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

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}


module.exports= router;