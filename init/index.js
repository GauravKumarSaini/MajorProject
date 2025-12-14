const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing");

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("connnect to DB");
}).catch ((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect(MONGO_URL);
    
}
async function main() {
    await mongoose.connect(MONGO_URL);
    
}
const initDB=async() =>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:'693d2f518319f07d3b8e3d14'}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();