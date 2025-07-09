import productModel from "../models/product.model.js";

const uploadProduct = async (req, res) => {
  try {
    const product = req.body;
    const uploadproduct = await productModel.create(product);
    if (uploadProduct) {
      return res
        .status(200)
        .json({ msg: "product uploaded successfully", uploadproduct });
    } else {
      return res.status(400).json({ msg: "someThing went wrong" });
    }
  } catch (error) {
    console.log("error in uploading product :", error);
  }
};

const allProducts = async (_, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json({ msg: "data fetched successfully", products });
  } catch (error) {
    console.log(error);
  }
};
const deleteProducts = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const deleteProduct = await productModel.deleteOne({ _id: id });
    console.log(deleteProduct);

    if (deleteProduct.deletedCount > 0) {
      res.status(200).json({ msg: "Product deleted Successfully" });
    } else {
      res.status(500).json({ msg: "someThing went wrong" });
    }
  } catch (error) {
    console.log(error);
  }
};
const updateProduct = async (req, res) => {
  const data = req.body;
  const { _id } = data;
  const updatedProduct = await productModel.findByIdAndUpdate(_id, data);
  if (updatedProduct) {
    res.json({ msg: "Product updated successfully" });
  }
};
const getProductCategories = async (req, res) => {
  try {
    const productCategory = await productModel.distinct("category");
    console.log(productCategory);

    //array to store one product from each category
    const productByCategory = [];
    for (const category of productCategory) {
      const product = await productModel.findOne({ category });
      if (product) {
        productByCategory.push(product);
      }
    }
    res.json({
      msg: "category product",
      data: productByCategory,
      success: true,
      error: false,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

const getCategoryWiseProducts = async (req, res) => {
  try {
    const { category } = req?.body || req?.query;

    const products = await productModel.find({ category });

    res.json({ msg: "product fetched", products });
  } catch (error) {
    console.log(error);
  }
};
const getSingleProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productModel.findById({ _id: productId });
    res.json({ msg: "product fetched", product });
  } catch (error) {
    console.log(error);
  }
};
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    console.log("query:", query);

    // const regex = new RegExp(query, i, g);
    const products = await productModel.find({
      $or: [{ productName: query }, { category: query }],
    });
    res.json({ msg: "product fetched", products });
  } catch (error) {
    console.log(error);
  }
};
const filterProducts = async (req, res) => {
  try {
    const categoryList = req?.body?.category || [];
   console.log("category:",categoryList);
   
    const product = await productModel.find({
      category: {
        $in: categoryList,
      },
    });

    res.json({
      data: product,
      msg: "product",
      error: false,
      success: true,
    });
  } catch (err) {
    res.json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};
export {
  uploadProduct,
  allProducts,
  deleteProducts,
  updateProduct,
  getProductCategories,
  getCategoryWiseProducts,
  getSingleProductDetails,
  searchProducts,
  filterProducts,
};
