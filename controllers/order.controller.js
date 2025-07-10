import stripe from "../config/stripe.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";

const endpointSecret = process.env.ENDPOINT_KEY;

// ===============================
// 1. PAYMENT CONTROLLER
// ===============================
const paymentController = async (request, response) => {
  try {
    const { cartItems } = request.body;
    const { userId } = request.user;

    const user = await userModel.findById(userId);

    const session = await stripe.checkout.sessions.create({
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_options: [
        {
          shipping_rate: "shr_1Q3v9AA1xDrAsNkiDOQNApl2",
        },
      ],
      customer_email: user.email,
      metadata: {
        userId: userId,
      },
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productId.productName,
            images: item.productId.productImage,
            metadata: {
              productId: item.productId._id,
            },
          },
          unit_amount: item.productId.sellingPrice * 100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: item.quantity,
      })),
      success_url: `https://ecommerce-frontend-blond-five.vercel.app/success`,
      cancel_url: `https://ecommerce-frontend-blond-five.vercel.app/cancel`,
    });

    response.status(200).json(session);
  } catch (error) {
    response.status(500).json({
      message: error?.message || "Payment error",
      error: true,
      success: false,
    });
  }
};

// ===============================
// 2. GET LINE ITEMS HELPER
// ===============================
const getLineItems = async (lineItems) => {
  const items = [];

  for (const item of lineItems.data) {
    const product = await stripe.products.retrieve(item.price.product);
    items.push({
      productId: product.metadata.productId,
      name: product.name,
      price: item.price.unit_amount / 100,
      quantity: item.quantity,
      image: product.images,
    });
  }

  return items;
};

// ===============================
// 3. STRIPE WEBHOOK
// ===============================
const webhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature error:", err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const productDetails = await getLineItems(lineItems);

      const orderDetails = {
        productDetails,
        email: session.customer_email,
        userId: session.metadata.userId,
        paymentDetails: {
          paymentId: session.payment_intent,
          payment_method_type: session.payment_method_types,
          payment_status: session.payment_status,
        },
        shipping_options: session.shipping_options?.map((s) => ({
          ...s,
          shipping_amount: s.shipping_amount / 100,
        })),
        totalAmount: session.amount_total / 100,
      };

      const order = new orderModel(orderDetails);
      const saved = await order.save();

      if (saved?._id) {
        await cartModel.deleteMany({ userId: session.metadata.userId });
        console.log("✅ Order saved and cart cleared.");
      }
    } catch (err) {
      console.error("❌ Error saving order:", err.message);
    }
  }

  response.status(200).send("Received");
};

// ===============================
// 4. ORDER CONTROLLER
// ===============================
const orderController = async (request, response) => {
  try {
    const { userId } = request.user;

    const orderList = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 });

    response.status(200).json({
      data: orderList,
      message: "User orders",
      success: true,
    });
  } catch (error) {
    response.status(500).json({
      message: error.message,
      error: true,
    });
  }
};

// ===============================
// 5. ALL ORDERS FOR ADMIN
// ===============================
const allOrderController = async (request, response) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 });

    return response.status(200).json({
      data: orders,
      success: true,
    });
  } catch (error) {
    response.status(500).json({
      message: error.message,
      error: true,
    });
  }
};

export { paymentController, webhooks, orderController, allOrderController };
