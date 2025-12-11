const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        require:true,
    },
    description: String,
    image:{
        filename:{
            type:String,
            default:"listingimage",
        },
        url:{
            type:String,
            default:
                "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fphoto-image-art&psig=AOvVaw295x0R3XNdxDnvjdQ9bjA2&ust=1763752334018000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOjTzcy3gZEDFQAAAAAdAAAAABAE",
            set:(v)=>
                v===""
            ?"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fphoto-image-art&psig=AOvVaw295x0R3XNdxDnvjdQ9bjA2&ust=1763752334018000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCOjTzcy3gZEDFQAAAAAdAAAAABAE"
            :v,
        },     
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review",
        },
    ],
});

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({ _id:{$in: listing.reviews}});
    }
})

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;