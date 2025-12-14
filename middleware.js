const Listing=require("./models/listing");

module.exports.isLoggedIn=(req,res,next)=>{
  if (!req.isAuthenticated()) {
    req.session.redirectUrl=req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner= async(req,res,next)=>{
  const { id } = req.params;
        let listing=await Listing.findById(id);
        if(!listing.owner.equals(res.locals.currUser._id)){
          req.flash("error","You don't have permission to edit!");
          return res.redirect(`/listing/${id}`);

        }
}