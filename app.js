const express 				= require('express'),
	bodyParser 				= require('body-parser'),
	mongoose 				= require('mongoose'),
	passport 				= require('passport'),
	LocalStrategy			= require('passport-local'),
	methodOverride 			= require('method-override'), // allows us to use ?_method overriding
	expressSanitizer 		= require('express-sanitizer'),
	Post 					= require('./models/post'),
	Comment 				= require('./models/comment'),
	User					= require('./models/user'),
	seedDB 					= require('./seeds');

const app = express();

//seems that this one should go after mongoose connect
seedDB();

//set up DB and express
mongoose.connect('mongodb://localhost:27017/blog_app', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false); //to remove deprecation warning

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static(__dirname+'/public'));
app.use(methodOverride('_method')); //connect lib to our app and declare the name of the method overriding

//PASSPORT CONFIGS
app.use(require('express-session')({
	secret: 'I will change that secret later',
	resave:false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//add an anonymus middleware before each route which add a new var (currentUser) to ejs files
app.use((req, res, next)=>{
	// req.user refers to authenticated user (or undifined when isn`t logged in)
	res.locals.currentUser = req.user;
	next();
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//RESTFUL ROUTES
app.get('/', (req, res) => {
	res.render('landing');
});

app.get('/posts', (req, res) => {
	Post.find({}, (err, posts) => {
		if (err) {
			console.log(err);
			return;
		}
		res.render('posts/index', { posts });
	});
});

// NEW ROUTE
app.get('/posts/new', (req, res) => {
	res.render('posts/new');
});

//CREATE ROUTE
app.post('/posts', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.create(req.body.blog, (err, newPost) => {
		if (err) {
			res.render('posts/new');
			console.log(err);
			return;
		}
		res.redirect('/posts');
	});
});

//SHOW ROUTE
//Now we have to send comments together using populate method
app.get('/posts/:id', (req, res) => {
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
app.get('/posts/:id/edit', (req, res) => {
	Post.findById(req.params.id, (err, foundPost) => {
		if (err) {
			console.log(err);
			res.redirect('/posts/' + req.params.id);
			return;
		}
		res.render('posts/edit', { post: foundPost });
	});
});

//UPDATE ROUTE
app.put('/posts/:id', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedPost) => {
		if (err) {
			console.log(err);

			res.redirect('/posts');
			return;
		} else {
			res.redirect('/posts/' + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete('/posts/:id', (req, res) => {
	Post.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			res.redirect('/posts' + req.params.id);
			return;
		}
		res.redirect('/posts');
	});
});

//COMMENT ROUTES

app.get('/posts/:id_post/comments/new',isLoggedIn, (req, res) => {
	Post.findById(req.params.id_post, (err, foundPost) => {
		if (err) {
			res.redirect('/posts' + req.params.id_post);
			return;
		}
		res.render('comments/new', { post: foundPost });
	});
});

app.post('/posts/:id_post/comments',isLoggedIn, (req,res)=>{
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
			foundPost.comments.push(newComment);
			foundPost.save();
			res.redirect('/posts/' + req.params.id_post);
		});

	});
});

//AUTH ROUTES
//==================
app.get('/register', (req,res)=>{
	res.render('register');
});

app.post('/register', (req,res)=>{
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
app.get('/login', (req, res)=>{
	res.render('login');
});

app.post('/login', passport.authenticate('local',{
	successRedirect:'/posts',
	failureRedirect:'/login' 
}) ,(req, res)=>{
});

//LOGOUT route
app.get('/logout',(req, res)=>{
	req.logout();
	res.redirect('/posts');
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login');
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, process.env.IP, () => {
	console.log('Server has started');
});
