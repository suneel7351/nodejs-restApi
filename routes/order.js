import express from "express";
import Order from "../controllers/order.js";
import Authenticated from "../middleware/authenticate.js";
import isAdmin from "../middleware/isAdmin.js";
const orderRouter = express.Router();

orderRouter.post("/new", Authenticated, Order.placeNewOrder);
orderRouter.get("/myOrders", Authenticated, Order.getAllOrders);
orderRouter
  .route("/order/:id")
  .get(Authenticated, Order.getOrderDetails)
  .put(Authenticated, isAdmin, Order.processOrder);
orderRouter.get("/allOrders", Authenticated, isAdmin, Order.getAdminOrders);

orderRouter.post("/payment", Authenticated, Order.processPayment);
export default orderRouter;
