import stripe from "../config/stripe.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";

const endpointSecret = process.env.ENDPOINT_KEY;

// ===============================
// 1. Payment Controller
// ===============================
const paymentController = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const { userId } = req.user;

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
      metadata: { userId },
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

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Payment session creation failed",
      success: false,
    });
  }
};

// ===============================
// 2. Get Line Items Helper
// ===============================
const getLineItems = async (lineItems) => {
  const products = [];

  for (const item of lineItems.data) {
    const product = await stripe.products.retrieve(item.price.product);

    products.push({
      productId: product.metadata.productId,
      name: product.name,
      price: item.price.unit_amount / 100,
      quantity: item.quantity,
      image: product.images,
    });
  }

  return products;
};

// ===============================
// 3. Stripe Webhook Handler
// ===============================
const webhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const productDetails = await getLineItems(lineItems);

      const order = new orderModel({
        productDetails,
        email: session.customer_email,
        userId: session.metadata.userId,
        paymentDetails: {
          paymentId: session.payment_intent,
          payment_method_type: session.payment_method_types,
          payment_status: session.payment_status,
        },
        shipping_options: (session.shipping_options || []).map((s) => ({
          ...s,
          shipping_amount: s.shipping_amount / 100,
        })),
        totalAmount: session.amount_total / 100,
      });

      const savedOrder = await order.save();

      if (savedOrder?._id) {
        await cartModel.deleteMany({ userId: session.metadata.userId });
        console.log("✅ Order saved and cart cleared");
      }
    } catch (err) {
      console.error("❌ Error handling session completion:", err.message);
    }
  }

  res.status(200).send("Webhook received");
};

// ===============================
// 4. Get User Orders
// ===============================
const orderController = async (req, res) => {
  try {
    const { userId } = req.user;

    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      data: orders,
      message: "Order list fetched",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch orders",
      error: true,
    });
  }
};

// ===============================
// 5. Get All Orders (Admin)
// ===============================
const allOrderController = async (req, res) => {
  try {
    const { userId } = req.user;

    await userModel.findById(userId); // Optional auth check

    const orders = await orderModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      data: orders,
      message: "All orders fetched",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch all orders",
      error: true,
    });
  }
};

export { paymentController, webhooks, orderController, allOrderController };
