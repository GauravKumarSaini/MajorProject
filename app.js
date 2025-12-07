// app.js (replace your current file with this)
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");
const Review = require("./models/review.js");

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

app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

const validateListing=(req,res,next) =>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

// index route
app.get("/listing", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// new route
app.get("/listing/new", (req, res) => {
  res.render("listings/new.ejs");
});

// show route
app.get("/listing/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// create route
app.post("/listing", 
    validateListing,
    wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listing");
}));

// edit route
app.get("/listing/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) return next(new ExpressError(404, "Listing not found"));
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// update route
app.put("/listing/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        res.redirect(`/listing/${id}`);
}));

// delete route
app.delete("/listing/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listing");
}));


//review
app.post("/listing/:id/reviews",async(req,res)=>{
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();

  console.log("new review saved");
  res.send("new review saved");

})

// -------------------------
// Catch-all for unmatched routes
// -------------------------
// IMPORTANT: do NOT use app.all('*', ...) or app.use('*', ...) — those can trigger path parsing.
// Use app.use(...) with no path so it always runs for requests that reach this point.
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
    let{statusCode=500,message="Somethig went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
//   const statusCode = err && err.statusCode ? err.statusCode : 500;
//   const message = err && err.message ? err.message : "Something went wrong";
//   res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
