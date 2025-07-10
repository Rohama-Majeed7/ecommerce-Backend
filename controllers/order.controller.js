// import { response ,r} from "express";
import stripe from "../config/stripe.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
const endpointSecret = process.env.ENDPOINT_KEY;

const paymentController = async (request, response) => {
  try {
    const { cartItems } = request.body;
    console.log(cartItems);

    const { userId } = request.user;
    const user = await userModel.findOne({ _id: userId });

    const params = {
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
      line_items: cartItems.map((item, index) => {
        return {
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
        };
      }),
      success_url: `https://ecommerce-frontend-blond-five.vercel.app/success`,
      cancel_url: `https://ecommerce-frontend-blond-five.vercel.app/cancel`,
    };

    const session = await stripe.checkout.sessions.create(params);

    response.status(200).json(session);
  } catch (error) {
    response.json({
      message: error?.message || error,
      error: true,
      success: false,
    });
  }
};
// ==============================================
async function getLIneItems(lineItems) {
  let ProductItems = [];

  if (lineItems?.data?.length) {
    for (const item of lineItems.data) {
      const product = await stripe.products.retrieve(item.price.product);
      const productId = product.metadata.productId;

      const productData = {
        productId: productId,
        name: product.name,
        price: item.price.unit_amount / 100,
        quantity: item.quantity,
        image: product.images,
      };
      ProductItems.push(productData);
    }
  }

  return ProductItems;
}

const webhooks = async (request, response) => {
  request.headers["stripe-signature"];

  const payloadString = JSON.stringify(request.body);

  const header = stripe.webhooks.generateTestHeaderString({
    payload: payloadString,
    secret: endpointSecret,
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payloadString,
      header,
      endpointSecret
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const productDetails = await getLIneItems(lineItems);

      const orderDetails = {
        productDetails: productDetails,
        email: session.customer_email,
        userId: session.metadata.userId,
        paymentDetails: {
          paymentId: session.payment_intent,
          payment_method_type: session.payment_method_types,
          payment_status: session.payment_status,
        },
        shipping_options: session.shipping_options.map((s) => {
          return {
            ...s,
            shipping_amount: s.shipping_amount / 100,
          };
        }),
        totalAmount: session.amount_total / 100,
      };

      const order = new orderModel(orderDetails);
      const saveOrder = await order.save();

      if (saveOrder?._id) {
        await cartModel.deleteMany({
          userId: session.metadata.userId,
        });
      }
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.status(200).send();
};
// ====================================================
const orderController = async (request, response) => {
  try {
    const { userId } = request.user;

    const orderList = await orderModel
      .find({ userId: userId })
      .sort({ createdAt: -1 });

    response.json({
      data: orderList,
      message: "Order list",
      success: true,
    });
  } catch (error) {
    response.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
};
const allOrderController = async (request, response) => {
  const { userId } = request.user;

  await userModel.findById(userId);

  const AllOrder = await orderModel.find().sort({ createdAt: -1 });

  return response.status(200).json({
    data: AllOrder,
    success: true,
  });
};

export { paymentController, webhooks, orderController, allOrderController };
