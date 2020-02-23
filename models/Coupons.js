const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema({
  clothing: String,
  link: String
});

mongoose.model("coupon", couponSchema);
