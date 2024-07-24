//jshint esversion:6

const express = require("express");
const bodyp = require("body-parser");
const ejs = require("ejs");
const session=require("express-session");
const mongoose=require("mongoose");
const _=require("lodash"); 
const passport=require("passport");
const psplcl=require("passport-local");
const psplclmng=require("passport-local-mongoose");
const bcrypt=require("bcrypt");
const saltRounds=12;



const homeStartingContent = "In our fast-paced and interconnected world, finding a private space to express our innermost thoughts and emotions can be a challenge. However, with the advent of technology, we now have the opportunity to create a personal diary in your own web, a secure sanctuary where we can pour out our hearts without fear of judgment or intrusion. Welcome to this digital haven where you can write your personal diary, knowing that no one else can see it."
const home2="By embracing this digital diary, you are opening the door to a realm of personal expression and growth. This private space allows you to write freely, knowing that your thoughts are protected from prying eyes. With its secure and user-friendly interface, you can embark on a journey of self-reflection, documenting your experiences, emotions, and aspirations with ease. Cherish this sanctuary as a means to cultivate self-awareness, gain insights, and preserve your memories. Embrace the power of the personal diary and unlock the transformative potential of self-expression.";
const aboutContent = "Our digital diary brings convenience and accessibility to your diary-keeping practice. Unlike traditional diaries, which can be insecure, for your secure purpose, our platform doesn't stores your entries in the cloud. This means you can access your diary from your own system, at any time, using your own device with an internet connection. Whether you prefer to write your personals, your diary is always at your fingertips.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyp.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:"my little secret.",
  resave:false,
  saveUninitialized:false  
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://mohan:mohan@cluster0.yvc1agc.mongodb.net/DiaryDB?retryWrites=true&w=majority",{
       useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(db => console.log('DB is connected'))
.catch(err => console.log(err));


////////////// USER /////////////
const userSchema=new mongoose.Schema({
  title:String,
  stitle:String,
  content:String
});
const User=mongoose.model("User",userSchema);



const postSchema=new mongoose.Schema({
  email:String,
  password:String,
  mat:[userSchema]
  
});

postSchema.plugin(psplclmng);
const Post=mongoose.model("Post",postSchema);




passport.use(Post.createStrategy());

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});  

var msg="";
var nam;
var x,id;
app.get("/",function(req,res){
   res.render("RL");
});

app.get("/home",function(req,res){
  run()
  async function run(){
    const u=await Post.findOne({ email:nam});
    if(u){
    id=u._id;
   res.render("home",{dis: homeStartingContent,
    posts: u.mat, mail:u.email
    });
  }else{
    res.send("page not found");
  }
  }

});

app.get("/about",function(req,res){
  run()
  async function run(){
    const u=await Post.findOne({ email:nam});
    if(u)
  res.render("about",{abo: aboutContent});
  else
  res.send("Page not Found");
  }
});

app.get("/contact",function(req,res){
  run()
  async function run(){
    const u=await Post.findOne({ email:nam});
    if(u)
  res.render("contact");
  else
  res.send("Page not Found");
  }
});

app.get("/compose",function(req,res){
  run()
  async function run(){
    const u=await Post.findOne({ email:nam});
    if(u)
  res.render("compose",{mail:nam});
  else
    res.send("Page not Found");
  }
});


app.post("/compose",function(req,res){
  const n=req.body.btn;
   const post= new User({
    title:req.body.txt,
    stitle:req.body.stxt,
    content: req.body.txta
   });
   run() 
   async function run(){ 
   const u=await Post.findOne({email:n});
   if(u){
   u.mat.push(post);
   
   u.save();
   res.redirect("/home");
   }else{
    console.log("error");
   }
  }
});

app.get("/posts/:pid",function(req,res){

 const rid=req.params.pid;
 run()
 async function run(){
    const pst=await Post.findById(id);
    const post=pst.mat.id(rid);
     res.render("post",{sltitle: post.title,sstitle:post.stitle,slcontent: post.content});
        
 }
});

app.get("/register",function(req,res){
  res.render("register");
});
app.get("/login",function(req,res){
   
  res.render("login",{incorrect:"",val:""});
});

app.get('/logout', (req, res) => {
  req.logout(function(err){
    if(err){console.log(err);}
    nam="";
 res.redirect("/");
 });
});

app.post("/register",function(req,res){
  //console.log(req.body.username);
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser=new Post({
      email:req.body.username,
       password:hash 
  });
       const u=newUser.save();
       console.log(req.body.password);
       if(u)
       res.redirect("/login");
});
});
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  run()
  async function run(){
    const u=await Post.findOne({email:username});
    if(!u)
    res.send("No user Found");
    else{
      if(u){
        bcrypt.compare(password,u.password).then(function(result){
          if(result===true){
             id=
            req.session.user = req.body.user;
            req.session.save(function (err) {
              if (err) return next(err);
              
            });

            msg="";
            nam=username;
          res.redirect("/home");
          }
          else{
            msg="Incorrect password, try again!"
            res.render("login",{incorrect: msg,val:username});
          }
        });
      }
    }
  } 

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});



/** run()
          async function run(){
            const u=await Post.findOne({ email:nam});
            const post= new Post({
              title:"",
              stitle:"",
              content: ""
             });
             u.mat.push(post);
             u.save();
          } */



     /*    

  /**
   Post.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
    console.log(err);
    res.redirect("/register");
    }else{

      passport.authenticate("local")(req,res,function(){
       
        res.redirect("/login");
      });
    }

 }); 
    
   const user= new Post({
    username:req.body.username,
    password:req.body.password
 });
 req.login(user,function(err){
  if(!(req.isAuthenticated())){
    res.redirect('/login');
  }
    else{
      nam=req.body.username;
    passport.authenticate("local")(req,res,function(){
      res.redirect("/home");
    });
    
 }}); */