const express = require('express');
const router = express.Router();
const Post = require('../models/post');
//index.js is a special name so when you require a folder it automatically points to that file
const middleware = require('../middleware');


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
router.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('posts/new');
});

//CREATE ROUTE
router.post('/', middleware.isLoggedIn, (req, res) => {
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
			console.log(err);
			req.flash('error', err.message);
			return res.render('posts/new');
		}
		req.flash('success', 'You have created the post');
		res.redirect('/posts');
	});
});

//SHOW ROUTE
//Now we have to send comments together using populate method
router.get('/:id', (req, res) => {
	Post.findById(req.params.id).populate('comments').exec((err, foundPost) => {
		if (err || !foundPost) {
			console.log(err);
			req.flash('error', 'Cannot find the post');
			return res.redirect('/posts');
		}
		res.render('posts/show', { post: foundPost });
	});
});
//EDIT ROUTE
router.get('/:id/edit', middleware.checkPostOwnership, (req, res) => {
	Post.findById(req.params.id, (err, foundPost) => {
		if (err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('/posts');
		}
		res.render('posts/edit', { post: foundPost });
	});
});

//UPDATE ROUTE
router.put('/:id', middleware.checkPostOwnership, (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedPost) => {
		if (err) {
			console.log(err);
			return res.redirect('/posts');
		}
		req.flash('success', 'Post is changed');
		res.redirect('/posts/' + req.params.id);
	});
});

//DELETE ROUTE
router.delete('/:id', middleware.checkPostOwnership, (req, res) => {
	Post.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			return res.redirect('/posts' + req.params.id);
		}
		req.flash('success', 'Post deleted');
		res.redirect('/posts');
	});
});

module.exports = router;