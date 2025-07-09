import reviewModel from "../models/review.model.js";

// Add Review Endpoint
const addReview =  async (req, res) => {
    try {
      const { userId, productId, rating, comment } = req.body;
      const review = new reviewModel({ userId, productId, rating, comment });
      await review.save();
      console.log("add review");
      res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
      res.status(500).json({ message: 'Error adding review', error });
    }
  };
  
  // Get Reviews for a Product Endpoint
  const getReview = async (req, res) => {
    try {
      const { productId } = req.params;
      console.log("get review",productId);

      const reviews = await reviewModel.find({ productId }).populate("userId");
      res.status(200).json(reviews);
      
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reviews', error });
    }
  };
  
  // Delete Review Endpoint
 const deleteReview =  async (req, res) => {
    try {
      const { id } = req.params;
      await reviewModel.findByIdAndDelete(id);
      res.status(200).json({ message: 'Review deleted successfully' });
      console.log("delete review");
      
    } catch (error) {
      res.status(500).json({ message: 'Error deleting review', error });
    }
  };

  export {getReview,addReview,deleteReview}
  
