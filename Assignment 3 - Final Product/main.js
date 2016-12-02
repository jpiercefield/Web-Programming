//Data array
posts = [{
    id:1,
    title:'Superfrog takes picture of the century.',
    description:'This frog aint nothin like them toads y\'all gonna find in them marshes. Superfrog is a photograph extraordinaire!',
    timestamp:'May 05 2016, 18:00',
    src:'img/classimg1.jpg'
},
    {
        id:2,
        title:'Blue flies cure cancer.',
        description:'The yeahbrah tribes of central New Jersey are immune to certain viral strands of cancer, thanks to the regenerative properties of irradiated blue flies they inadvertedly ingest on a daily basis.',
        timestamp:'May 34 2011, 14:00',
        src:'img/classimg2.jpg'
    }];

function getPosts(){
    return posts;
}

var express = require('express');
var app = express();
var formidable = require("formidable");
var moment = require("moment");

var handlebars = require('express3-handlebars').create({
    defaultLayout:'main'
});

//Settings for handlebars to be used as engine
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

//Parsers for POST requests and cookies
app.use(require('body-parser')());
//Set express to use cookie parser and set secret
app.use(require("cookie-parser")("44ughj_6vx^)yosp=sga-7_blo$luz6o154z&b1u&5+n48oo%k"));

//Set root directory for static content.
app.use('/public', express.static(__dirname + '/public'));

//Set variable for all posts to be displayed on main page
app.use(function(req, res, next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.posts = getPosts();
    next();
});

//Route handler for homepage
app.get('/', function(req, res) {
    res.locals.partials.pageTitle = 'Home Page';
    res.render('home');
});

app.get('/login', function(req,res){
    res.locals.partials.pageTitle = 'Upload Login';
    res.render('login');
});

app.post('/login', function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err) return res.redirect(303, '/error');

        var valid = true;
        var atpos = fields.email.indexOf("@");
        var dotpos = fields.email.lastIndexOf(".");
        if (atpos<1 || dotpos<atpos+2 || dotpos+2>=fields.email.length) {
            valid=false;
            res.render('login',{error:"Not a valid e-mail address"});
        }
        if(fields.userpass.length == 0)
        {
            valid=false;
            res.render('login',{error:"Password Field Cannot Be Empty"});
        }
        if(valid){
            res.cookie('authenticated',true,{maxAge:60000});
            res.redirect('upload');
        }
    });
});

//Route handler for photo details
app.get('/photodetail/:id', function(req,res){

    res.locals.partials.pageTitle = 'Photo Details';
    var posts = getPosts();
    var len = posts.length;
    var item = {};
    //Find post in array
    for(i=0;i<len;i++){
        if(posts[i].id==req.params.id){
            item = posts[i];
            break;
        }
    }
    //Send data to photodetail page
    res.render('photodetail', item);
});

//Route handler for upload page
app.get('/upload', function(req,res){
    if(req.cookies.authenticated){
        res.locals.partials.pageTitle = 'Upload';
        res.render('upload');
    }else{
        res.redirect('/login');
    }
});

//Handler for POST requests made on upload page
app.post('/upload', function(req,res){
    var form = new formidable.IncomingForm();

    //Set path where uploaded image files will be saved
    form.on('fileBegin', function(name, file) {
        file.path = __dirname + '/public/img/' + file.name;
    });

    //Parse request for data and uploaded file
    form.parse(req, function(err, fields, files){
        if(err)
            return res.redirect(303, '/error');

        //Get details and store in object
        var len = getPosts().length + 1;
        var data = {
            id:len,
            title:fields.title,
            description:fields.description,
            src:'img/'+files.file.name,
            timestamp: moment().format('MMM DD YYYY, HH:mm')
        };
        //Push data to array (prepend)
        posts.unshift(data);
        //Send back to home page
        res.redirect('/');
    });
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

//Listen on defined port
app.listen(app.get('port'), function(){
    console.log( 'Photo upload app started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});