import AsyncError from "../utils/asyncError.js";
import ProductModel from "../models/product.js";
import ErrorHandler from "../middleware/errorHandler.js";
import Category from "../models/category.js";
import cloudinary from "cloudinary";
import { dataUri } from "../utils/features.js";
class Product {
  //   <----------------Get All Products---------------------->
  static getAllProduct = AsyncError(async (req, res, next) => {
    const { category, keyword } = req.query;

    const products = await ProductModel.find({
      name: {
        $regex: keyword ? keyword : "",
        $options: "i",
      },
      category: category ? category : undefined,
    });

    res.status(200).json({ success: true, products });
  });

  //   <----------------Get Product Details---------------------->
  static getProductDetails = AsyncError(async (req, res, next) => {
    const product = await (
      await ProductModel.findById(req.params.id)
    ).populate("category");

    if (!product) return next(new ErrorHandler(404, "Product not found."));

    res.status(200).json({
      success: true,
      product,
    });
  });

  //   <----------------Create New Product---------------------->

  static createNewProduct = AsyncError(async (req, res, next) => {
    const { name, description, price, stock, category } = req.body;
    if (!name || !description || !price || !stock || !category)
      return next(new ErrorHandler(400, "All fields are required."));
    if (!req.file) return next(new ErrorHandler(400, "Image is required."));
    const file = dataUri(req.file);
    const upload = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
    await ProductModel.create({
      name,
      description,
      price,
      stock,
      images: [image],
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
    });
  });

  //   <----------------Update Product---------------------->

  static updateProduct = AsyncError(async (req, res, next) => {
    const { name, description, price, stock, category } = req.body;
    let product = await ProductModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found."));

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;
    await product.save();
    res
      .status(200)
      .json({ success: true, message: "Product update successfully." });
  });

  //   <----------------Upload Images---------------------->

  static uploadImages = AsyncError(async (req, res, next) => {
    let product = await ProductModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found."));
    if (!req.files)
      return next(new ErrorHandler(400, "Image/Images required."));
    if (req.files) {
      for (let index = 0; index < req.files.length; index++) {
        const x = req.files[index];
        const file = dataUri(x);
        const upload = await cloudinary.v2.uploader.upload(file.content);
        product.images.push({
          public_id: upload.public_id,
          url: upload.secure_url,
        });
      }
    }

    await product.save();
    res
      .status(200)
      .json({ success: true, message: "Image/Images upload successfully." });
  });

  //   <-------------------Delete Images---------------------->

  static deleteImages = AsyncError(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found."));

    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }

    product.images = [];
    await product.save();

    res
      .status(200)
      .json({ success: true, message: "Image deleted successfully." });
  });

  //   <-------------------Delete Product---------------------->

  static deleteProduct = AsyncError(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return next(new ErrorHandler(404, "Product not found."));

    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }

    await product.remove();

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully." });
  });

  //   <-------------Add Category------------>
  static addCategory = AsyncError(async (req, res, next) => {
    await Category.create(req.body);

    res
      .status(201)
      .json({ success: true, message: "Category created Successfully." });
  });

  //   <-------------get All Categories------------>
  static getAllCategories = AsyncError(async (req, res, next) => {
    const categories = await Category.find({});

    res.status(201).json({ success: true, categories });
  });

  //   <-------------Delete Category------------>
  static deleteCategory = AsyncError(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) return next(new ErrorHandler(404, "Category not found."));

    const products = await ProductModel.find({ category: category._id });

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      product.category = undefined;
      await product.save();
    }

    await category.remove();

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  });

  // <-------------Get All products Admin------------>

  static getAllProductsAdmin = AsyncError(async (req, res, next) => {
    const products = await ProductModel.find({}).populate("category");

    const outOfStock = products.filter((i) => i.stock < 1);

    res.status(200).json({
      success: true,
      products,
      outOfStock,
      inStock: products.length - outOfStock,
    });
  });
}
export default Product;
