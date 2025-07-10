import cartModel from "../models/cart.model.js";

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body; // Use req.body directly, no need for optional chaining.
    const { userId } = req.user; // Assuming userId is available from req.user
    const user = req.user;
    // Check if the product already exists for this specific user
    const isProductAvailable = await cartModel.findOne({ productId, userId });
    if (isProductAvailable) {
      return res.json({ msg: "Product already exists in cart" });
    }

    // Create a new cart item if not already present
    const payLoad = {
      productId: productId,
      quantity: 1,
      userId: userId,
    };

    const newCart = new cartModel(payLoad);
    const saveProduct = await newCart.save();

    return res.json({
      data: saveProduct,
      msg: "Product added to cart",
      success: true,
      error: false,
      user
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Something went wrong", success: false, error: true });
  }
};

const countCartItems = async (req, res) => {
  try {
    const { userId } = req.user;
    const count = await cartModel.countDocuments({ userId: userId });
    res.json({ msg: "cart count", count });
  } catch (error) {
    console.log(error);
  }
};

const addToCartViewProduct = async (req, res) => {
  try {
    const { userId } = req.user;
    const cartProducts = await cartModel
      .find({
        userId: userId,
      })
      .populate("productId");

    res.json({ msg: "cart products", cartProducts });
  } catch (error) {
    console.log(error);
  }
};

const updateAddToCartProduct = async (req, res) => {
  try {
    // const { currentUserId } = req.user;
    const addToCartProductId = req?.body?._id;

    const qty = req.body.quantity;
    console.log(qty);

    const updateProduct = await cartModel.updateOne(
      { _id: addToCartProductId },
      {
        ...(qty && { quantity: qty }),
      }
    );

    res.json({
      message: "Product Updated",
      data: updateProduct,
      error: false,
      success: true,
    });
  } catch (err) {
    res.json({
      message: err?.message || err,
      error: true,
      success: false,
    });
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    // const { currentUser } = req.user;
    const { productID } = req.params;
    console.log("productID", productID);

    const deletedProduct = await cartModel.deleteOne({ _id: productID });
    console.log("deleted Product", deletedProduct);
    if (deletedProduct.deletedCount > 0) {
      res.status(200).json({ msg: "Product deleted from cart Successfully" });
    } else {
      res.status(500).json({ msg: "someThing went wrong" });
    }
  } catch (error) {
    console.log(error);
  }
};

export {
  addToCart,
  countCartItems,
  addToCartViewProduct,
  updateAddToCartProduct,
  deleteCartProduct,
};
