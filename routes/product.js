import express from "express";
import Product from "../controllers/product.js";
import Authenticated from "../middleware/authenticate.js";
import isAdmin from "../middleware/isAdmin.js";
import { multiUpload, singleUpload } from "../middleware/multer.js";

const router = express.Router();
router.get("/all", Product.getAllProduct);
router.get("/admin", Authenticated, isAdmin, Product.getAllProductsAdmin);
router.post(
  "/create",
  Authenticated,
  isAdmin,
  singleUpload,
  Product.createNewProduct
);
router
  .route("/product/:id")
  .get(Product.getProductDetails)
  .put(Authenticated, isAdmin, Product.updateProduct)
  .delete(Authenticated, isAdmin, Product.deleteProduct);

router
  .route("/images/:id")
  .post(Authenticated, isAdmin, multiUpload, Product.uploadImages)
  .delete(Authenticated, isAdmin, Product.deleteImages);

router.post("/createCategory", Authenticated, isAdmin, Product.addCategory);
router.get("/getAllCategories", Product.getAllCategories);

router.delete("/category/:id", Authenticated, isAdmin, Product.deleteCategory);
export default router;
