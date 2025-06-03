const handleCastError = (err) => {};
const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError" && err.kind === "ObjectId") {
    err.statusCode = 404;
    err.message = "Resource not found by given Id or Data";
  }
  if (err.name === "ValidationError") {
    err.status = "please provide valid data";
  }
  if (err.name === "JsonWebTokenError") {
    err.status = "You are logged out..Please login";
  }
  if (err.code === 11000) {
    err.status = "Duplicated field value Occured";
  }
  if (err.name === "MongooseError") {
    err.status = "Failed to connect to the database. Please try again later.";
  }
  res.status(400).json({
    message: err.message,
    name: err.name,
    status: err.status,
    stack: err.stack,
  });
};
module.exports = errorHandler;
