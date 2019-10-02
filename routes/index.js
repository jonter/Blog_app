const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Token = require('../models/token');
const passport = require('passport');
const crypto = require('crypto');// helps us to generate random hashed strings (internal node module)
const nodemailer = require('nodemailer');

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
	const newUser = new User({username: req.body.username, email: req.body.email});
	//handle error with the registered user
	User.register(newUser, req.body.password, (err,user)=>{
		if(err){
			console.log(err);
			req.flash('error', err.message);
			//there could be res.render() instead redirect
			return res.redirect('/register');
		}
		passport.authenticate('local')(req, res, function(){	
			// Token creation
			Token.create({ userId:user._id, token: crypto.randomBytes(16).toString('hex')}, 
			(err, newToken)=>{
				if(err) { req.flash('error', err.message); return res.redirect('/register'); } 
				const transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					port: 465,
					secure: true,
					auth: {
						user: process.env.EMAIL_USER, 
						pass: process.env.EMAIL_PASS 
					},
					tls:{
						rejectUnauthorized: false
					}
				});
				const output = `
					<h2> Welcome to Blog_app </h2>
					<p> To confirm your account please click the link below: </p>
					<p> <a href = "http://${req.headers.host}/confirmation/${newToken.token}"> http://${req.headers.host}/confirmation/${newToken.token} </a>  </p>
					<p><em> The confirmation link is avaliable for 12 hours </em></p>
				`;
				transporter.sendMail({
					from: `"Blog_app" <${process.env.EMAIL_USER}>`, 
					to: user.email,
					subject: 'Email confirmation ✔', 
					html: output
				}, (err, info)=>{
					if(err){
						req.flash(err);
						return res.redirect('back')
					}
					req.flash('success', `Please, confirm your accont with your email. The letter sent to ${user.email}`);
					res.redirect('/posts');
				});

			});
		});

	});
});

//TOKEN CONFIRMATION ROUTE

router.get('/confirmation/:token', (req, res)=>{
	Token.findOne({token:req.params.token}, (err, foundToken)=>{
		if(err){
			req.flash('error', 'We were unable to find a valid token. Your token my have expired.');
			return res.redirect('/posts');
		}
		User.findById(foundToken.userId, (err, foundUser)=>{
			if(err){
				req.flash('error', 'We were unable to find a user to this token. Try to log in to resend confirmation');
				return res.redirect('/posts');
			}
			if(foundUser.isVerified) {
				req.flash('success', 'The account is already verified');
				return res.redirect('/posts');
			}
			foundUser.isVerified = true;
			foundUser.save((err, updatedUser)=>{
				if(err){req.flash('error', err.message); res.redirect('/posts')}
				req.flash('success','The account has been verified. Please log in.')
				res.redirect('/login');
			});
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
	User.findById(req.user._id, (err, foundUser)=>{
		if(err || !foundUser){
			req.flash('error', 'Wrong password or username');
			res.redirect('/login');
		}
		//...

	});
});

//LOGOUT route
router.get('/logout',(req, res)=>{
	req.logout();
	res.redirect('/posts');
	req.flash('success', 'Logged you out!');
});

module.exports = router;