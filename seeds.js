const mongoose =    require('mongoose');
const Post =        require('./models/post');
const Comment =     require('./models/comment');

data = [
    {
        title: 'Shrek The First',
        image:'https://i.ytimg.com/vi/7UHreDvHi78/maxresdefault.jpg',
        body: '  My beloved monster and me we go everywhere together wearing a raincoat that has 4 sleeves'
    },
    {
        title: 'Shrek 2',
        image:'https://i.ytimg.com/vi/LzJ1fo-oUpk/maxresdefault.jpg',
        body: '2 2M2y 2b2elo2ve2d 2monster a2d me we go ev2erywhere together 2wearing 2a rain2coat t2hat has 4 sleeves'
    },
    {
        title: 'Shrek The Third ',
        image:'https://images-na.ssl-images-amazon.com/images/I/81EL111GonL._SY445_.jpg',
        body: '  Gachimuchi какой-то'
    }
]


function seedDB(){
    //remove all the posts
    Post.deleteMany({},(err)=>{
        //obsolete Comment model has changed
        // if(err) {
        //     console.log(err);
        //     return;
        // }
        // console.log('removed all the posts!');
        // //add a few posts
        // data.forEach((onePost)=>{
        //     Post.create(onePost, (err, newPost)=>{
        //         if(err){
        //             console.log(err);
        //             return;
        //         }

        //         console.log('added a campground');
        //         //add a few comments to them

        //         Comment.create({
        //             text:'I extremly love shrek!!!!',
        //             author: 'ShIL'
        //         }, (err, newComment)=>{
        //             if(err){
        //                 console.log(err);
        //                 return;
        //             }
        //             newPost.comments.push(newComment);
        //             newPost.save();
        //             console.log('created new comment')
        //         });

        //     });

        // });
    });
    
}

module.exports = seedDB;
