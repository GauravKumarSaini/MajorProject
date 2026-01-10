const Listing = require("../models/listing");
const cloudinary = require("../cloudConfig");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// INDEX
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// SHOW LISTING
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listing");
  }

  res.render("listings/show.ejs", { listing });
};

// CREATE LISTING
module.exports.createListing = async (req, res) => {
  let response=await geocodingClient
  .forwardGeocode({
  query: req.body.listing.location,
  limit: 1,
})
  .send()
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry=response.body.features[0].geometry;


  // Upload image to Cloudinary
  if (req.file) {
    const file = req.file;
    const base64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "wanderlust_DEV",
    });

    newListing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };
  }

  let saveListing=await newListing.save();
  console.log(saveListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listing");
};

// EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listing");
  }
  let orignalImageUrl=listing.image.url;
  orignalImageUrl.replace("upload","upload/w_250")

  res.render("listings/edit.ejs", { listing });
};

// UPDATE LISTING ✅ FIXED
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // Update text fields
  let listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true }
  );

  // Update image only if new file uploaded
  if (req.file) {
    const file = req.file;
    const base64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "wanderlust_DEV",
    });

    listing.image = {
      url: result.secure_url,
      filename: result.public_id,
    };

    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listing/${id}`);
};

// DELETE LISTING
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listing");
};
