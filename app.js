const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const user=require("./models/user.js");

const ListingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const cookie = require("express-session/session/cookie.js");
const userRouter=require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
  console.log("connected to DB");
}).catch((err) => {
  console.error("DB connection error:", err);
});

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionOption={
  secret: "mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+ 7 * 24 * 60 * 60 * 1000,
    maxAge:7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
  },
};

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
})

// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new user({
//     email:"student@gmail.com",
//     username:"delta-student"
//   });

//   let registerUser=await user.register(fakeUser,"helloworld");
//   res.send(registerUser);
// })

app.use("/listing",ListingRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
    let{statusCode=500,message="Somethig went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});

});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
