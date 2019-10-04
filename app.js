const express 				= require('express'),
	bodyParser 				= require('body-parser'),
	mongoose 				= require('mongoose'),
	flash 					= require('connect-flash'),
	passport 				= require('passport'),
	LocalStrategy			= require('passport-local'),
	methodOverride 			= require('method-override'), // allows us to use ?_method overriding
	expressSanitizer 		= require('express-sanitizer'),
	User					= require('./models/user'),
	seedDB 					= require('./seeds');
const app = express();

const indexRoutes = require('./routes/index'),
	  commentRoutes = require('./routes/comments'),
	  postsRoutes = require('./routes/posts');

//let us use env variables defined in .env file (dotenv package)
if(process.env.IS_PRODUCTION == undefined){
	console.log('kek');
	require('dotenv').config();
}

//set up DB and express
const url = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog_app';
mongoose.connect(url, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false); //to remove deprecation warning

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static(__dirname+'/public'));
app.use(methodOverride('_method')); //connect lib to our app and declare the name of the method overriding

app.use(flash());

//PASSPORT CONFIGS
app.use(require('express-session')({
	secret: process.env.PASSPORT_SECRET,
	resave:false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, User.authenticate()));

//add an anonymus middleware before each route which add a new var (currentUser) to ejs files
app.use((req, res, next)=>{
	// req.user refers to authenticated user (or undifined when isn`t logged in)
	res.locals.currentUser = req.user;
	//now the variable will be availiable for every route
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//add routes from another files
//app.use(postsRoutes); without string argument we have to write the whole route path 
app.use(indexRoutes);
app.use('/posts',postsRoutes);
app.use('/posts/:id_post/comments',commentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, process.env.IP, () => {
	console.log('Server has started');
});
