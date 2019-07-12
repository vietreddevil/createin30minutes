var express = require('express');
var router = express.Router();
const session = require('express-session');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(session({
  secret: "izuna",
  resave: true,
  saveUninitialized: true
}));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' , status: 'out'});//chua dang nhap
});
//login
router.get('/login', (req, res)=> {
  res.render('login');
});

router.post('/checklogin', urlencodedParser, (req, res)=> {
  
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  
  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("select * from user where email = '" + req.body.username + "' and password = '" + req.body.password + "'", function (error, result) {
      if(error) return res.redirect('/login');
      req.session.loggedin = true;
      res.cookie("user_id", result[0].user_id, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });
      return res.redirect('/home');
    });
  });
  
});
router.get('/register', (req, res)=> {
  res.render('register');
});
router.post('/register', urlencodedParser, (req, res) => {
  console.log(req.body);
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  
  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("insert into user (name, age, gender, email, password) values ('" + req.body.name + "', '" + req.body.age + "', '" + req.body.gender + "', '" + req.body.username + "', '" + req.body.password + "')", function (error, result) {
      if(error) return res.redirect('/error');
      return res.redirect('/login');
    });
  });
});
//end login

/** home */
router.get('/home', (req, res)=> {
  if(req.session.loggedin) {
    res.render('home');
  }else {
    return res.redirect('/');
  }
  
});

router.post('/updateprofile', urlencodedParser, (req, res)=> {
  var name=req.body.name;
  var age = req.body.age;
  var gender = req.body.gender;
  var email = req.body.email;
  var enjoycity = "";
  var travel_type = "";
  if(req.body.favorite_city != undefined) {
    for(var i = 0; i < req.body.favorite_city.length; i ++) {
      enjoycity += req.body.favorite_city[i] + " ";
    }
  }
  if(req.body.travel_type != undefined) { 
    for(var i = 0; i < req.body.travel_type.length; i ++) {
      travel_type += req.body.travel_type[i] + " ";
    }
  }
  
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("update user set name='" + name + "', age='" + age + "', enjoy_city='" + enjoycity + "', gender='" + gender + "', travel_type='" + travel_type + "', email='" + email + "' where user_id = '" + req.cookies["user_id"] + "'", function (error, result) {
      if(error) res.redirect('/');
      return res.redirect('/profile');
    });
  });
});
/** end home */
/** profile */
router.get('/profile', (req, res)=> {
  if(!req.session.loggedin) {
    return res.redirect('/');
  }else {
    var connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "hack"
    });
    console.log(req.cookies["user_id"]);
    connection.connect((err) => {
      if (err) console.log(err)
      connection.query("select * from user where user_id = '" + req.cookies["user_id"] + "'", function (error, result) {
        if(error) return res.send(err);
        return res.render('profile', {info: result[0]});
      });
    });
  }  
});
/** end profile */
module.exports = router;
