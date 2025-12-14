const express=require("express");
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner}=require("../middleware.js")

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
router.get("/new", isLoggedIn,(req, res) => {
  res.render("listings/new.ejs");
});


// show route
router.get(
  "/:id", wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate("reviews")
    .populate("owner");
    if (!listing){
      req.flash("error","Listing you requested is not exist!");
      res.redirect("/listing");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
  }) 
);

// create route
router.post("/",isLoggedIn, 
    validateListing,
    wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listing");
}));

// edit route
router.get("/:id/edit", isLoggedIn,isOwner,async (req, res, next) => {
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
    isLoggedIn,
    isOwner, 
    validateListing,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { ...req.body.listing });
        req.flash("success","Listing Updated!");
        res.redirect(`/listing/${id}`);
}));

// delete route
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
   req.flash("success","Listing Deleted!");
  res.redirect("/listing");
}));

module.exports=router;

