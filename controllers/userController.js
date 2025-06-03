const asyncHandler = require("express-async-handler");
const path = require("path");
const fs = require("fs");
const User = require("../models/userModel.js");
const AppError = require("../AppError.js");

//GET USERDETAILS  AUTHORIZED PERSON ONLY /getuser
exports.getUserDetails = asyncHandler(async (req, res, next) => {
  const currentUserId = req.currentUser._id;
  // const currentUserId = "677c0f9f1b7d41e214f5cc51";
  const user = await User.findById(currentUserId);
  if (!user) return next(new AppError("User doesnt exist", 401));
  res.status(200).json({
    status: "success",
    data: user,
  });
});
//get all users for admin
exports.getAllUser = asyncHandler(async (req, res, next) => {
  const user = await User.find({});

  if (user.length === 0) return next(new AppError("No users", 401));
  res.status(200).json({
    status: "success",
    data: user,
  });
});
//ONLY FOR ADMIN  /getuser/:id
exports.getUserDetailsById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new AppError("User doesnt exist", 401));
  res.status(200).json({
    status: "success",
    data: user,
  });
});
//UPDATE USER DETAILS  PUT /update-user-info
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  const { email, password, name, newemail } = req.body;
  console.log(req.body);
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new AppError("User not found", 400));
  }

  const isPasswordValid = await user.correctPassword(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError("Please provide the correct information", 400));
  }
  // Create an object to hold the fields that should be updated
  const updateFields = {};
  //check if file data exist
  if (req.file) {
    if (user.photo && user.photo !== "default.jpg") {
      const filePath = path.join(__dirname, "../public/img/users/", user.photo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("file is deleted");
      }
    }
    updateFields.photo = req.file.filename;
  }

  // Conditionally update fields if they are provided
  if (name && name !== null) updateFields.name = name;
  if (newemail && newemail !== null) updateFields.email = newemail;

  // If neither name nor newemail is provided, no update will occur
  if (Object.keys(updateFields).length === 0) {
    return next(new AppError("No fields to update", 400));
  }

  // Perform the update
  const doc = await User.findByIdAndUpdate(
    user.id,
    updateFields, // Only update the fields that were provided
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    data: doc,
  });
});
//ADD addresse to the existing user
exports.postAddress = asyncHandler(async (req, res, next) => {
  const { country, city, address1, address2, zipCode, addressType } = req.body;
  //country, city, address1, address2, zipCode, addressType
  const userid = req.currentUser.id;

  const userExist = await User.findById(userid);
  if (!userExist) return next(new AppError("user not exist", 400));
  const existSameAddressType = userExist.addresses.find(
    (address) => address.addressType === addressType
  );
  if (existSameAddressType) {
    return next(new AppError("address already exists", 400));
  } else {
    userExist.addresses.push(req.body);
  }
  await userExist.save({ validateBeforeSave: false });
  res.status(201).json({
    status: "address successfully added",
    data: userExist,
  });
});
//delete address of the existing user
exports.deleteUserAddress = asyncHandler(async (req, res, next) => {
  //const userid = req.currentUser.id;
  const addressId = req.params.id;
  const userid = "677c0f9f1b7d41e214f5cc51";
  const userExist = await User.findById(userid);
  if (!userExist) return next(new AppError("user not exist", 400));
  const updatedUser = await User.findOneAndUpdate(
    { _id: userid },
    {
      $pull: { addresses: { _id: { $eq: addressId } } },
    },
    { new: true }
  );
  res.status(201).json({
    status: "address successfully deleted",
    data: updatedUser,
  });
});
