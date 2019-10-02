const Post = require('../models/post');
const Comment = require('../models/comment');
const Token = require('../models/token');

const crypto = require('crypto');// helps us to generate random hashed strings (internal node module)
const nodemailer = require('nodemailer');

const middlewareObject = {};

//This middleware also check if the user`s account verified
middlewareObject.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		
		if(req.user.isVerified){
			return next();
		}	
		//find the token and if it exists then only message: "check your email"
		//otherwise resend a token (together with an another message)
		Token.findOne({userId: req.user._id}, (err, foundToken)=>{
			if(err){
				req.flash('error', err);
				res.redirect('back');
			}else if (!foundToken){

				// creating new token...
				Token.create({ userId: req.user._id, token: crypto.randomBytes(16).toString('hex')}, 
				(err, newToken)=>{
					if(err) { req.flash('error', err.message); return res.redirect('back'); } 
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
					<h2> Verification for Blog_app </h2>
						<p> We resent verification token for your account. Check the link below: </p>
						<p> <a href = "http://${req.headers.host}/confirmation/${newToken.token}"> http://${req.headers.host}/confirmation/${newToken.token} </a>  </p>
						<p><em> The confirmation link is avaliable for 12 hours </em></p>
					`;
					// resend token email...
					transporter.sendMail({
						from: `"Blog_app" <${process.env.EMAIL_USER}>`, // sender address
						to: req.user.email, // list of receivers
						subject: 'Account verification ✔', // Subject line
						html: output // html body
					}, (err, info)=>{
						if(err){
							req.flash(err);
							return res.redirect('back')
						}
						req.flash('error', `You have to confirm your account (${req.user.email}) to do that!\n
							We sent a new confirmation link to your email`);
						res.redirect('back');
					});

				});

			}else{
				req.flash('error', `You have to confirm your account (${req.user.email}) to do that!\n
				Please check your email to confirm it (if you cannot find the letter check spam folder)`);
				return res.redirect('back');
			}
		});
	}else{
		req.flash('error', 'You have to be logged in!');
		res.redirect('/login');
	}
}



//middleware for user permission identification (can the user manage the comment)
middlewareObject.checkCommentOwnership = function(req, res, next){
	Comment.findById(req.params.id_comment, (err, foundComment) => {
		//sometimes findById doesn`t send error, but send null instead of foundComment/foundPost
		//so we get rid of the issue 
		if (err || !foundComment) {
			console.log(err);
			req.flash('error', 'Cannot find the comment');
			return res.redirect('back');
		}

		if(foundComment.author.id && foundComment.author.id.equals(req.user._id)){
			next();
		}else{
			req.flash('error', 'You don`t have permissons to do that!');
			res.redirect('back');
		}		
	});
}

//another middleware for user permission identification (can the user manage the post)
middlewareObject.checkPostOwnership = function(req, res, next){
	// if(!req.isAuthenticated()){
	// 	req.flash('error', 'You have to be logged in!');
	// 	return res.redirect('/login');
	// }
	Post.findById(req.params.id, (err, foundPost) => {
		//see line 21 for explanation
		if (err || !foundPost) {
			console.log(err);
			req.flash('error', 'Cannot find the post');
			return res.redirect('back');
		}

		if(foundPost.author.id && foundPost.author.id.equals(req.user._id)){
			next();
		}else{
			req.flash('error', 'You don`t have permissons to do that!');
			res.redirect('back');
		}		
	});
}

module.exports = middlewareObject;