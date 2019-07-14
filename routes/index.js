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
router.get('/', function (req, res, next) {
  if (req.session.loggedin) {
    return res.redirect('/home');
  } else {
    res.render('index', { title: 'Express', status: 'out' });//chua dang nhap
  }

});
//login
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/checklogin', urlencodedParser, (req, res) => {

  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });

  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("select * from user where email = '" + req.body.username + "' and password = '" + req.body.password + "'", function (error, result) {
      if (error) return res.redirect('/login');
      req.session.loggedin = true;
      res.cookie("user_id", result[0].user_id, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });
      res.cookie("user_gender", result[0].gender, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });
      res.cookie("user_favor_place", result[0].user_id, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });
      res.cookie("user_age", result[0].user_id, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });
      res.cookie("user_travel_type", result[0].user_id, {
        expires: new Date(Date.now() + 253402300000000),
        httpOnly: true
      });

      return res.redirect('/home');
    });
  });

});
router.get('/register', (req, res) => {
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
      if (error) return res.redirect('/error');
      return res.redirect('/login');
    });
  });
});
//end login

/** home */
router.get('/home', (req, res) => {
  if (req.session.loggedin) {
    res.render('home');
  } else {
    return res.redirect('/');
  }

});

router.post('/updateprofile', urlencodedParser, (req, res) => {
  var name = req.body.name;
  var age = req.body.age;
  var gender = req.body.gender;
  var email = req.body.email;
  var enjoycity = "";
  var travel_type = "";
  if (req.body.favorite_city != undefined) {
    for (var i = 0; i < req.body.favorite_city.length; i++) {
      enjoycity += req.body.favorite_city[i] + " ";
    }
  }
  if (req.body.travel_type != undefined) {
    for (var i = 0; i < req.body.travel_type.length; i++) {
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
      if (error) res.redirect('/');
      return res.redirect('/profile');
    });
  });
});
/** end home */
/** profile */
router.get('/profile', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/');
  } else {
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
        if (error) return res.send(err);
        return res.render('profile', { info: result[0] });
      });
    });
  }
});
/** end profile */
/** create plan */
//1st step
router.post('/createplan', urlencodedParser, (req, res) => {
  res.cookie("des", req.body.des, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  res.cookie("time", req.body.time, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  res.cookie("child", req.body.child, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  res.cookie("adult", req.body.adult, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  res.cookie("old", req.body.old, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  res.cookie("budget", req.body.budget, {
    expires: new Date(Date.now() + 253402300000000),
    httpOnly: true
  });
  return res.redirect('/choose_properties');
});

router.get('/choose_properties', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect('/');
  } else {
    res.render('choose_properties');
  }
})

router.post('/aftercreate', urlencodedParser, (req, res) => {
  var travel_type = "";
  if (!req.body || req.body.travel_type == undefined) {
    travel_type = "[]";
  } else {
    if(Array.isArray(req.body.travel_type)) {
      for (var i = 0; i < req.body.travel_type.length; i++) {
        if (i == req.body.travel_type.length - 1) {
          travel_type += req.body.travel_type[i] + "";
        } else {
          travel_type += req.body.travel_type[i] + ",";
        }
      }
    }else {
      travel_type += req.body.travel_type + "";
    }
    
  }
  var request = require('request');
  var options = {
    uri: 'http://284a06ac.ngrok.io',
    method: 'POST',
    json: {
      form: {
        travel_type: travel_type, destionation: req.cookies['des'], travel_time: req.cookies['time'],
        children_num: req.cookies['child'], adult_num: req.cookies['adult'], old_people_num: req.cookies['old'], budget: req.cookies['budget'],
        user_gender: req.cookies['child'], user_favor_place: req.cookies['user_favor_place'], user_age: req.cookies['user_age'], user_favor_travel_type: req.cookies['user_travel_type']
      }
    }

  };
  request(options, function (error, response, body) {
    res.cookie("sql_body", JSON.stringify(body), {
      expires: new Date(Date.now() + 253402300000000),
      httpOnly: true
    });
    console.log(body);
    res.render('plan', {dess:body,type: 'new',day:req.cookies['time'], str_sql : JSON.stringify(body)});
  });
});
router.post('/test', urlencodedParser, (req, res) => {
  console.log(req.body);
  res.send('oke');
})
router.get('/plan', (req, res) => {
  res.render('plan');
});
router.get('/saveplan/:name', (req, res)=> {
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  var body = JSON.parse(req.cookies['sql_body']);
  console.log(req.cookies['sql_body'])
  connection.query("insert into plan (name) values ('" + req.params.name + "')", function (error, result) {});
  for(var i = 0; i < body.length; i++) {
    if(body[i].morning != []) {
      for(var k = 0; k < body[i].morning.length; k++) {
        var img = body[i].morning[k].img;
        var name = body[i].morning[k].name;
        var rating = body[i].morning[k].rating;
        var plan_name = req.params.name;
        var numberReview = body[i].morning[k].numberReview;
        var daystart = req.cookies['time'];
        var day = body[i].day;
        var price = body[i].morning[k].Price;
        var type = body[i].morning[k].type;
        connection.query("insert into location (img, name, rating, plan_name, numberReview, daystart, price, type, status, day) values ('" 
        + img + "', '" + name + "', '" + rating + "', '" + plan_name + "', '" + numberReview + "', '" + daystart + "', '" + day + "', '" + price + "', '" + type + "')", function (error, result) {});
      }
    }
    if(body[i].afternoon != []) {
      for(var k = 0; k < body[i].afternoon.length; k++) {
        var img = body[i].afternoon[k].img;
        var name = body[i].afternoon[k].name;
        var rating = body[i].afternoon[k].rating;
        var plan_name = req.params.name;
        var numberReview = body[i].afternoon[k].numberReview;
        var daystart = req.cookies['time'];
        var day = body[i].day;
        var price = body[i].afternoon[k].Price;
        var type = body[i].afternoon[k].type;
        connection.query("insert into location (img, name, rating, plan_name, numberReview, daystart, price, type, status, day) values ('" 
        + img + "', '" + name + "', '" + rating + "', '" + plan_name + "', '" + numberReview + "', '" + daystart + "', '" + day + "', '" + price + "', '" + type + "')", function (error, result) {});
      }
    }
  }
});
/** end create plan */
/** plan */
router.get('/myplan', (req, res) => {
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("select * from plan", function (error, result) {
      if (error) return res.send(err);
      return res.render('myplan', { plans: result });
    });
  });
});
router.get('/openplan/:id', (req, res) => {
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hack"
  });
  connection.connect((err) => {
    if (err) console.log(err)
    connection.query("select * from plan where id = '" + req.params.id + "'", function (error, result) {
      if (error) return res.send(err);
      return res.render('pplan', { dess: JSON.parse(result[0].content)});
    });
  });
});
/** end plan*/
router.get('/suggest/:lat/:long', (req, res)=> {
  var request = require('request');
  var options = {
    uri: 'http://284a06ac.ngrok.io/suggest',
    method: 'POST',
    json: {
      form: {
        longitude: req.params.long, latitude: req.params.lat, user_favor_place: req.cookies['user_favor_place'], user_age: req.cookies['user_age'], user_favor_travel_type: req.cookies['user_travel_type']
      }
    }
  };
  request(options, function (error, response, body) {
    res.cookie("sql_body", JSON.stringify(body), {
      expires: new Date(Date.now() + 253402300000000),
      httpOnly: true
    });
    console.log(body);
    res.render('plan', {dess:body,type: 'new',day:req.cookies['time'], str_sql : JSON.stringify(body)});
  });
});
module.exports = router;
