const AppError = require("../AppError.js");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel.js");
const { default: mongoose } = require("mongoose");
const { json } = require("express");
const { isEmpty } = require("validator");
//for uploading images

//creat a new product
exports.createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    category,
    originalPrice,
    discountPrice,
    stock,
    ratings,
    shopId,
    sold_out,
    reviews,
  } = req.body;
  const images = req.body.images || [];
  console.log(images);
  //check if there is images
  //create document and save into db
  const newProduct = await Product.create({
    name,
    description,
    category,
    originalPrice,
    discountPrice,
    stock,
    reviews,
    ratings,
    shopId,
    sold_out,
    images,
  });
  res.status(200).json({
    data: newProduct,
    message: "new product created successfully",
    status: "success",
  });
});

////////////get elemet by id
exports.getProductById = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  //check if id is valid mongoose id or not
  const checkIsValidId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
  };

  if (!checkIsValidId(productId))
    return next(new AppError("Invalid product ID format", 400));
  //if id valid then further code
  const product = await Product.findById(productId);
  if (!product) return next(new AppError("Id of product is not valid", 404));
  res.status(200).json({
    data: product,
    status: "success",
  });
});
//get all products and filter
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  //get names of all products for searchbar functionality
  if (req.query.namesOnly === "true") {
    const { searchText } = req.query;
    //if no searchterm juz return nothing
    if (!searchText || searchText.trim() === "") {
      return res.status(204).send(); // No content
    }
    const searchQuery = searchText
      ? { name: { $regex: searchText, $options: "i" } }
      : null;

    const productList = await Product.find(searchQuery).select(
      "name images _id"
    );

    if (productList.length === 0)
      return next(new AppError("No products available", 404));
    res.status(200).json({
      totalItems: productList.length,
      productList,
      status: "success",
    });
  }
  //filtering
  else {
    let queryObj = { ...req.query };
    const excludeQueryItems = ["sort", "page", "limit", "fields"];
    excludeQueryItems.forEach((el) => delete queryObj[el]);
    //adding $ sign infront of operators
    queryObj = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|lte|gt|lt)\b/g,
        (match) => `$${match}`
      )
    );

    //query
    let query = Product.find(queryObj);
    //query operators
    //sort
    if (req.query.sort) {
      query = query.sort(req.query.sort.split(",").join(" "));
    } else {
      query = query.sort({ createdAt: -1 });
    }
    //fields
    if (req.query.fields) {
      query = query.select(req.query.fields.split(",").join(" "));
    }

    //pagination

    const limit = parseInt(req.query.limit || 0);
    const page = parseInt(req.query.page || 1);
    let skipItems = (page - 1) * limit;
    //total no of documents counting
    const totalDocumentsCount = await Product.countDocuments();

    query = query.skip(skipItems).limit(limit);

    const allProducts = await query;
    if (!allProducts.length)
      return next(new AppError("No products available", 404));
    //send response
    res.status(200).json({
      totalDocumentsCount,
      length: allProducts.length,
      products: allProducts,
      status: "success",
    });
  }
});
//getproducts by category
exports.getProductsByCategory = asyncHandler(async (req, res, next) => {
  const productCategory = req.params.category;

  const products = await Product.find({ category: productCategory });

  if (!products.length)
    return next(new AppError("No products available on this category", 404));
  res.status(200).json({
    data: products,
    status: "success",
  });
});
//ONLY ADMIN ROUTES
//updates Products by Id by ADMIN
exports.updateProductDetailsById = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;

  if (!Object.keys(req.body).length) {
    return next(new AppError("Please provide valid updation fields", 404));
  }
  const isProductExist = await Product.findById(productId);
  if (!isProductExist)
    return next(new AppError("Product Id is not Valid", 404));
  const updatedProductDetails = await Product.findByIdAndUpdate(
    productId,
    req.body,
    { runValidators: true, new: true }
  );
  res.status(201).json({
    data: updatedProductDetails,
    status: "Product successfully updated",
  });
});
//delete products by id by ADMIN
exports.deleteProductById = asyncHandler(async (req, res, next) => {
  const productId = req.params.id;
  const isProductExist = await Product.findById(productId);
  if (!isProductExist)
    return next(new AppError("Product Id is not Valid", 404));
  const deleteProduct = await Product.findByIdAndDelete(productId);

  res.status(204).json({
    status: "Product successfully deleted",
  });
});
//craete a review
exports.writeReview = asyncHandler(async (req, res, next) => {
  const { comment, rating } = req.body;

  //getting product id and user id from url
  const { userId, productId } = req.params;

  //check whether the user ordered the given product
  const product = await Product.findById(productId).populate({
    path: "reviews.userId",
    select: "name",
  });
  if (!product) return next(new AppError("product not exist", 404));
  const isReviewed = product.reviews.find(
    (rev) => rev.userId && rev.userId.equals(userId)
  );

  //check whether user already post a review or not, if existed then update current one else push new one
  if (isReviewed) {
    product.reviews.forEach((el) => {
      if (el.userId === isReviewed.userId) el.comment = comment;
      el.rating = rating;
    });
  } else {
    product.reviews.push({
      userId,
      rating,
      comment,
    });
  }

  const reviewPosted = await product.save({ validateBeforeSave: false });
  if (!reviewPosted) return next(new AppError("Error in posting Review", 404));
  //calculating average rating
  let totalRating = 0;
  product.reviews.forEach((rev) => (totalRating += rev.rating));
  product.ratings = Math.round(totalRating / product.reviews.length);
  console.log(product.ratings);
  await product.save({ validateBeforeSave: false });
  //sending response
  res.status(201).json({
    length: product.reviews.length,
    status: "Review posted successfully",
    data: product,
  });
});
//delete review by id--ADMIN ONLY
exports.deleteReviewPostedById = asyncHandler(async (req, res, next) => {
  const { reviewId, productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) return next(new AppError("Product is not exist", 404));
  product.reviews = product.reviews.filter((rev) => {
    if (!rev._id.equals(reviewId)) return rev;
  });

  await product.save({ validateBeforeSave: false });
  //updating average rating
  let totalRating = 0;
  product.reviews.forEach((rev) => (totalRating += rev.rating));

  product.ratings = (totalRating / product.reviews.length).toFixed(2);

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    status: "Review successfully deleted",
  });
});
//getting all categories from database uploaded data
exports.getCategoriesName = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}, "category -_id");
  // Check if no products were found
  if (!products || products.length === 0) {
    return next(new AppError("np product found", 404));
  }
  //new set
  const categoriesName = [
    ...new Set(products.map((product) => product.category)),
  ];

  res.status(200).json({
    message: "Successfully retrieved categories",
    data: categoriesName,
  });
});
//get total product numbers
exports.getProductsTotalCount = asyncHandler(async (req, res, next) => {
  const totalProducts = await Product.countDocuments(); // Get total count
  res.status(200).json({ status: "success", total: totalProducts });
});
//get categories of all products
exports.getCategoriesCount = asyncHandler(async (req, res, next) => {
  const categoriesByCount = await Product.aggregate([
    { $group: { _id: "$category", totalCount: { $sum: 1 } } },
  ]);
  res.status(200).json({
    status: "success",
    data: categoriesByCount,
  });
});
