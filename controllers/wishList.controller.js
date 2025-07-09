import wishList from "../models/wishList.model.js";

// Add item to wishlist
const addToWishlist = async (req, res) => {
  const { userId, productId, name, image, price } = req.body;

  // Construct the item object
  const item = {
    productId,
    name,
    image,
    price,
  };
  console.log("item in wish list:", item);

  try {
    // Find if the user already has a wishlist
    let wishlist = await wishList.findOne({ userId });

    if (!wishlist) {
      // If no wishlist found, create a new one and save the item
      wishlist = new wishList({
        userId,
        items: [],
      });
      await wishlist.save();
      // return res.status(200).json(wishlist);
    } else {
      // Check if the product is already in the wishlist to avoid duplicates
      const productExists = wishlist.items.some(
        (product) => product.productId.toString() === productId.toString()
      );

      if (productExists) {
        return res
          .status(400)
          .json({ message: "Product is already in the wishlist" });
      } else {
        // If not, add the new item to the wishlist
        wishlist.items.push(item);
        await wishlist.save();
        return res.status(200).json(wishlist);
      }
    }
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    return res
      .status(500)
      .json({ message: "Error adding to wishlist", error: err.message });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  const { userId } = req.params;
  console.log("wishlist user:", userId);

  // const userId = req.user.id
  try {
    const wishlist = await wishList.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    res.status(200).json(wishlist);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching wishlist", error: err.message });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const wishlist = await wishList.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => !item.productId.equals(productId)
    );
    await wishlist.save();

    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({
      message: "Error removing item from wishlist",
      error: err.message,
    });
  }
};

export { addToWishlist, getWishlist, removeFromWishlist };
