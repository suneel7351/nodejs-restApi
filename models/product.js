import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter product name"],
  },
  description: {
    type: String,
    required: [true, "Enter product description"],
  },
  stock: {
    type: Number,
    required: [true, "Enter product stock"],
  },
  price: {
    type: Number,
    required: [true, "Enter product price"],
  },
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
});

const ProductModel = mongoose.model("Product", schema);

export default ProductModel;
