const express=require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const Listing = require("../models/listing.js");

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
router.get("/", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// new route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

// show route
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if (!listing){
      req.flash("error","Listing you requested is not exist!");
      res.redirect("/listing");
    } 
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// create route
router.post("/", 
    validateListing,
    wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listing");
}));

// edit route
router.get("/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing){
      req.flash("error","Listing you requested is not exist!");
      res.redirect("/listing");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// update route
router.put("/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success","Listing Updated!");
        res.redirect(`/listing/${id}`);
}));

// delete route
router.delete("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
  res.redirect("/listing");
}));

module.exports=router;

