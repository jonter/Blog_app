const express = require('express');
const router = express.Router();
const Post = require('../models/post');


// I get rid of '/posts' cause app.use('/posts',...)
router.get('/', (req, res) => {
	Post.find({}, (err, posts) => {
		if (err) {
			console.log(err);
			return;
		}
		res.render('posts/index', { posts });
	});
});

// NEW ROUTE
router.get('/new', isLoggedIn, (req, res) => {
	res.render('posts/new');
});

//CREATE ROUTE
router.post('/', isLoggedIn, (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//create an author (as in postSchema)
	const author = {
		id: req.user._id,
		username: req.user.username
	};
	// add an author to the post
	req.body.blog.author = author;
	Post.create(req.body.blog, (err, newPost) => {
		if (err) {
			res.render('posts/new');
			console.log(err);
			return; 
		}
		console.log(newPost);
		res.redirect('/posts');
	});
});

//SHOW ROUTE
//Now we have to send comments together using populate method
router.get('/:id', (req, res) => {
	Post.findById(req.params.id).populate('comments').exec((err, foundPost) => {
		if (err) {
			console.log(err);
			res.redirect('/posts');
			return;
		}
		res.render('posts/show', { post: foundPost });
	});
});
//EDIT ROUTE
router.get('/:id/edit',checkPostOwnership, (req, res) => {
	Post.findById(req.params.id, (err, foundPost) => {
		res.render('posts/edit', { post: foundPost });
	});
});

//UPDATE ROUTE
router.put('/:id',checkPostOwnership, (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedPost) => {
		if (err) {
			console.log(err);
			return res.redirect('/posts');
		}
		res.redirect('/posts/' + req.params.id);
	});
});

//DELETE ROUTE
router.delete('/:id',checkPostOwnership, (req, res) => {
	Post.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			return res.redirect('/posts' + req.params.id);
		}
		res.redirect('/posts');
	});
});

//another middleware for user permission identification (can the user manage the post)
function checkPostOwnership(req, res, next){
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

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}


module.exports = router;