import mongoose from "mongoose";

const schema = new mongoose.Schema({
  category: { type: String, required: [true, "Enter Product's category"] },
});

const Category = mongoose.model("Category", schema);

export default Category;
