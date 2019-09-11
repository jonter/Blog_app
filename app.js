const 	express 				= require('express'),
		bodyParser 				= require('body-parser'),
		mongoose 				= require('mongoose'),
		methodOverride 			= require('method-override'),// allows us to use ?_method overriding
		expressSanitizer 		= require('express-sanitizer'),
		Post 					= require('./models/post');

const 	app = express();

//set up DB and express
mongoose.connect('mongodb://localhost:27017/blog_app', { useNewUrlParser: true });
mongoose.set("useFindAndModify", false); //to remove deprecation warning

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static('public'));
app.use(methodOverride('_method'));//connect lib to our app and declare the name of the method overriding

// Post.create({
//     title: 'Engineering problems',
//     image: 'https://images.unsplash.com/photo-1485965373059-f07657e9f841?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
//     body: 'A growing appreciation of individual preferences and aptitudes has led toward more “personalized learning,” in which instruction is tailored to a student’s individual needs. Given the diversity of individual preferences, and the complexity of each human brain, developing teaching methods that optimize learning will require engineering solutions of the future.'
// });
// Post.create({
//     title: 'Engineering solustions',
//     image: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
//     body: 'As computers have become available for all aspects of human endeavors, there is now a consensus that a systematic approach to health informatics - the acquisition, management, and use of information in health - can greatly enhance the quality and efficiency of medical care and the response to widespread public health emergencies.'
// });

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
		res.render('posts', { posts });
	});
});

// NEW ROUTE
app.get('/posts/new', (req, res) => {
	res.render('new');
});

//CREATE ROUTE
app.post('/posts', (req, res) => {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.create(req.body.blog, (err, newPost) => {
		if (err) {
			res.render('new');
			console.log(err);
			return;
		}
		res.redirect('/posts');
	});
});

//SHOW ROUTE
app.get('/posts/:id', (req, res) => {
	Post.findById(req.params.id, (err, foundPost) => {
		if (err) {
			console.log(err);
			res.redirect('/posts');
			return;
		}
		res.render('show', { post: foundPost });
	});
});
//EDIT ROUTE
app.get('/posts/:id/edit', (req, res)=>{
	Post.findById(req.params.id, (err, foundPost)=>{
		if(err){
			console.log(err);
			res.redirect('/posts/' + req.params.id);
			return;
		}
		res.render('edit', { post: foundPost });
	});
});

//UPDATE ROUTE
app.put('/posts/:id', (req, res)=>{
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Post.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedPost)=>{
		if(err){
			console.log(err);

			res.redirect('/posts');
			return;
		}else{
			res.redirect('/posts/'+req.params.id);
		}
	}); 
});

//DELETE ROUTE
app.delete('/posts/:id', (req,res)=>{
	Post.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			res.redirect('/posts'+req.params.id);
			return;
		}
		res.redirect('/posts');
	});
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, process.env.IP, () => {
	console.log('Server has started');
});
