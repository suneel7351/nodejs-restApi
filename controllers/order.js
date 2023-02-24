import OrderModel from "../models/order.js";
import ProductModel from "../models/product.js";
import AsyncError from "../utils/asyncError.js";
import ErrorHandler from "../middleware/errorHandler.js";
import { stripe } from "../server.js";
class Order {
  // <====================Process Payment=================>

  static processPayment = AsyncError(async (req, res, next) => {
    const { totalAmount } = req.body;
    if (!totalAmount)
      return next(new ErrorHandler(400, "Total amount is required."));
    const { client_secret } = await stripe.paymentIntents.create({
      // it will take in lowest currency ,in this case it will take in paisa
      amount: totalAmount * 100,
      currency: "inr",
    });
    res.status(200).json({ success: true, client_secret });
  });

  // <---------------Place new order------------------->
  static placeNewOrder = AsyncError(async (req, res, next) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingCharges,
      totalPrice,
    } = req.body;

    if (
      !shippingInfo ||
      !orderItems ||
      !paymentInfo ||
      !itemPrice ||
      !taxPrice ||
      !shippingCharges ||
      !totalPrice
    )
      return next(new ErrorHandler(400, "All fields are required."));
    await OrderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentInfo,
      itemPrice,
      taxPrice,
      shippingCharges,
      totalPrice,
    });

    for (let index = 0; index < orderItems.length; index++) {
      let product = await ProductModel.findById(orderItems[index].product);
      product.stock -= orderItems[index].quantity;
      await product.save();
    }
    res
      .status(201)
      .json({ success: true, message: "Order placed successfully." });
  });

  // <---------Get All Orders---------------->
  static getAllOrders = AsyncError(async (req, res, next) => {
    const orders = await OrderModel.find({ user: req.user._id });

    res.status(200).json({ success: true, orders });
  });

  // <=============Get Order Details========================>
  static getOrderDetails = AsyncError(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return next(new ErrorHandler(404, "Order not found."));

    res.status(200).json({ success: true, order });
  });

  // <=============Process Order========================>
  static processOrder = AsyncError(async (req, res, next) => {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return next(new ErrorHandler(404, "Order not found."));

    if (order.orderStatus === "Preparing") order.orderStatus = "Shipped";
    else if (order.orderStatus === "Shipped") {
      order.orderStatus = "Delivered";
      order.deliveredAt = new Date(Date.now());
    } else return next(new ErrorHandler(400, "Order already delivered."));

    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order processed successfully." });
  });

  // <=============GEt All Orders(Admin)========================>

  static getAdminOrders = AsyncError(async (req, res, next) => {
    const orders = await OrderModel.find({});

    res.status(200).json({ success: true, orders });
  });
}

export default Order;
