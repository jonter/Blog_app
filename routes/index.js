const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

//ROOT ROUTE
router.get('/', (req, res) => {
	res.render('landing');
});

//AUTH ROUTES
//==================
router.get('/register', (req,res)=>{
	res.render('register');
});

router.post('/register', (req,res)=>{
	const newUser = new User({username: req.body.username})
	User.register(newUser, req.body.password, (err,user)=>{
		if(err){
			console.log(err);
			req.flash('error', err.message);
			//there could be res.render() instead redirect
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function(){
			req.flash('success', 'Welcome to my blog, '+user.username);
			res.redirect('/posts');
		});

	});
});

//LOGIN routes
router.get('/login', (req, res)=>{
	res.render('login');
});

router.post('/login', passport.authenticate('local',{
	successRedirect:'/posts',
	failureRedirect:'/login' 
}) ,(req, res)=>{
});

//LOGOUT route
router.get('/logout',(req, res)=>{
	req.logout();
	res.redirect('/posts');
	req.flash('success', 'Logged you out!');
});

module.exports = router;