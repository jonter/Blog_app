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
			//there could be res.render() instead redirect
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function(){
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
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}

module.exports = router;