var express = require("express");
var sql = require('mysql');
const fs = require('fs');
var ip = require("ip");
var session = require('express-session');
const bodyParser = require('body-parser');
var global_increment=0;
var connection = sql.createConnection({
  host     : 'userdb.c75hsef0b9wp.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'password',
  database : 'users'
});
var app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) ;
app.use(session({

secret: 'my express secret',
saveUninitialized: true,
resave: true,
rolling: true,
maxAge: 900000

}));

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ...");
} else {
    console.log("Error connecting database ...");
}
});

app.post("/login",function(req,res){
var uname = req.body.username;
var pw = req.body.password;
var fname;
var ret;
//console.log('login');
  if(uname&&pw){

    console.log('Before query '+uname);
    console.log(pw);
    var u=uname;
    var p=pw;
    //var sql="SELECT * from login WHERE username="+u;
    connection.query('SELECT * FROM login WHERE username=?',[u],function(err, rows, fields) {

      console.log(rows);

      if(err){
        res.send("Querying Error 1");
      }
      else{
        console.log(rows);
        if(rows.length==0){//username does not exist
          console.log('username does not exist');
          res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
        }
        else{//username exists,validate password
          console.log('username exists');
          if(rows[0].password==pw){//password matches
            console.log('User has been validated');
            fname=rows[0].firstname;
            req.session.loginstatus=true;
            req.session.username=uname;
            req.session.firstname=fname;
            res.send({"message":"Welcome "+fname});
          }
          else{//password does not match
            res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
          }
        }
      }
    });
  }
  else{
    res.send({"message":"There seems to be an issue with the username/password combination that you entered"});
  }
});


/** ADD Method **/
//Need to check if user is logged in
app.post('/add', function(req,res){
  if(req.session.loginstatus==true)
  {
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    var result;
    if(!isNaN(num1) && !isNaN(num2))
    {
        //now add

        result = parseInt(num1)+parseInt(num2);
        res.send({"message":"This action was successful","result":result});

    }
    else {
      res.send({"message":"The numbers you entered are not valid"});
    }
  }
  else {
    res.send ({"message":"You are not currently logged in"});
  }

});

app.post('/divide', function(req,res){
if(req.session.loginstatus==true)
{
  var num1 = req.body.num1;
  var num2 = req.body.num2;
  var result;
  console.log('In divide');
  console.log(isNaN(num1));
  console.log(isNaN(num2));
if(isNaN(num1) || isNaN(num2) || num2=="0")
{

    res.send({"message":"The numbers you entered are not valid"});

}
else {
  //now divide
  console.log('num1='+num1+' num2='+num2);
  result = parseInt(num1)/parseInt(num2);
  res.send({"message":"This action was successful","result":result});

}
}
else {
  res.send ({"message":"You are not currently logged in"});
}
});


app.post('/multiply', function(req,res){
  if(req.session.loginstatus==true){
    var num1 = req.body.num1;
    var num2 = req.body.num2;
    var result;
    if(!isNaN(num1) && !isNaN(num2))
    {
        //now multiply

        result = parseInt(num1)*parseInt(num2);
        res.send({"message":"This action was successful","result":result});

    }
    else {
      res.send({"message":"The numbers you entered are not valid"});
    }
  }
  else {
    res.send ({"message":"You are not currently logged in"});
  }

});

app.post('/logout', function(req, res){
  console.log('logout');
  if(req.session.loginstatus == true){
    req.session.loginstatus=false;
    req.session.destroy;
    res.send({"message":"You have been successfully logged out"});
  }
  else{
    res.send({"message":"You are not currently logged in"});
  }
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});
