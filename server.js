"use strict"

var express=require("express");
var mustache = require('mustache-express');
var session = require("express-session")

var model = require('./model');
var app = express();
let port = 3000;

app.use("/assets",express.static(__dirname +"/assets"));



app.use('/ImgLogo', express.static(__dirname + "/Images/ImgLogo"));
app.use('/ImgCourts', express.static(__dirname + "/Images/ImgCourts"));
app.use('/ImgMaps', express.static(__dirname + "/Images/ImgMaps"));

//app.use("/resources",express.static(__dirname +"/resources"));

const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret: 'mot-de-pass-du-cookie',
  maxAge: 30000
}));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

  

/***** Midlewere *****/

function isAuthenticated(req, res,next){
  /* */
  if (req.session.user != undefined ) {
    console.log("req.session.name " + req.session.name);  
    res.locals.authenticated=true;    
  } else {
    res.locals.authenticated=false;
  }
  return next();
}


/***** ROUTES *****/
app.get('/search',isAuthenticated, (req, res) => {
  var found = model.search(req.query.query, req.query.page);
  res.render('search',found);/*comment mettre {user_name:req.session.name} */
  
});

app.get('/readCourt/:id',isAuthenticated, (req, res) => {
  var entry = model.read(req.params.id);
  res.render('readCourt', entry );/*comment mettre {user_name:req.session.name} */
});

app.get('/',isAuthenticated,(req, res) =>{
  res.render('index',{user_name:req.session.name})
});

app.get('/home',isAuthenticated,(req, res) =>{
  res.render('home',{user_name:req.session.name})
});

app.get('/courts',isAuthenticated,(req, res) =>{
  res.render('courts',{user_name:req.session.name})
});

app.get('/NewCourt',isAuthenticated,(req,res)=>{
  res.render('newCourt',{user_name:req.session.name})
})

/******profile *****/

app.get('/userProfile',isAuthenticated,(req, res)=>{
  res.render('userProfile',{user_name:req.session.name});
})
/*******************/


/****POST METODS ****/
/*@TODO faut finir ça*/
app.post('/create', isAuthenticated,(req, res) => {
  var id = model.create(post_data_to_court(req));
  res.redirect('/readCourt/'+ id);
});

/***** LOGIN *****/
app.get('/login', (req,res) =>{
  res.render('login') 
});

app.post('/login', (req, res) =>{
  const user=model.login(req.body.name,req.body.password);
  if (user != -1) {
    req.session.user = user;
    req.session.name = req.body.name;
    console.log("user_id_login: " + req.session.user);
    console.log("user_name_login: " + req.session.name);
    res.redirect('/userProfile');

  } else {
    console.log("not identification")
    res.redirect('/login');
  }
});

/***** REGISTER **/
app.get('/register', (req,res) =>{
  res.render('register')
});


app.post('/register', (req, res) => {
  if(!('password' in req.body && 'confirm_password' in req.body && 'name' in req.body)) {
    console.log("register 0")
    res.status(400).send('invalid request');
    return;
  }
  if(req.body.password != req.body.confirm_password) {
    console.log("register 1 "+req.session.name);
    res.redirect('/register');
  } else {
    const user = model.new_user(req.body.name, req.body.password);
    console.log("user: "+user);
    if(user != -1) {
      req.session.user = user;
      console.log("register 2 "+req.session.name);
      res.redirect('/login');
    } else {
      console.log("register 3 "+req.session.name);
      res.redirect('/register');  
    }
  }
});

/***** LOGOUT ****/
app.get('/logout', (req,res) => {
  req.session.user = null;
  req.session.name = null;

  res.redirect('/');
});

//***** */
function post_data_to_court(req) {
  return {
    nameCourt: req.body.nameCourt,
    imgLogo: req.body.imgLogo,
    imgMaps: req.body.imgMaps,
    httpMaps: req.body.httpMaps,
    description: req.body.description,
    adresse: req.body.adresse,
    capacity: req.body.capacity,
    images: req.body.images
  };
}

app.listen(port, () => console.log('listening on http://localhost:'+port));