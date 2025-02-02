import Review from '../models/reviewModel.js'

//check existing review for a product in an order
export const reviewExistCheck = async (req, res) => {
    const { productId, orderId, userId } = req.params;

  const reviewExists = await Review.findOne({
    product: productId,
    order: orderId,
    user: userId,
  });

  res.json({ reviewed: !!reviewExists });
}

//create a new review
export const createReview = async (req, res) => {
    const { userId, productId, orderId, stars, reviewText } = req.body;

    const review = new Review({
      user: userId,
      product: productId,
      order: orderId,
      stars,
      reviewText,
    });
  
    await review.save();
    res.json({ success: true, message: 'Review submitted successfully' });
}