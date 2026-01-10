const Listing = require("../models/listing");
const cloudinary = require("../cloudConfig");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

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



// ✅ UPDATED CREATE LISTING (IMPORTANT)
module.exports.createListing = async (req, res) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // 🔥 Upload image to Cloudinary
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

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listing");
};

module.exports.renderEditForm = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing you requested does not exist!");
      return res.redirect("/listing");
    }

    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
};

module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  req.flash("success", "Listing Updated!");
  res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listing");
};
