const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const User = require("../models/userModel.js");
const AppError = require("../AppError.js");
const sendEmail = require("../utilis/sendEmail.js");

//CREATE TOKEN
const createToken = function (userId, res) {
  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.SECRET_KEY,
    { expiresIn: process.env.TOKEN_EXPIRES }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
      sameSite: "none",
  });
  return token;
};

//CREATE NEW USER POST /register
exports.registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, passwordConfirm } = req.body;
  if (req.file) photo = req.file.filename;
  else photo = "default.jpg";

  const userEmail = await User.findOne({ email });

  if (userEmail) {
    if (req.file) {
      const filename = req.file.filename;
      const filepath = `public/img/users/${filename}`;
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log("ERROR IN DELETING IMAGE FILE");
          res.status(500).json({ message: "error on deleting file" });
        } else {
          console.log("Image file deleted successfully");
        }
      });
    }
    return next(new AppError("User already exists", 400));
  }

  const user = await User.create({
    name,
    email,
    photo,
    role,
    password,
    passwordConfirm,
    passwordChangedAt: Date.now() - 1000,
  });

  const token = createToken(user._id, res);
  res.status(200).json({
    message: "user successfully registerd",
    data: user,
    token,
  });

  //req.currentUser = user;
  //console.log(user._id);
});
//LOGIN POST /login
exports.authUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("please provide email and password", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid Email or password", 401));
  const token = createToken(user._id, res);
  user.password = undefined;
  const userDetails = Object.assign(
    {},
    {
      name: user.name,
      _id: user._id,
      photo: user.photo,
      email: user.email,
      role: user.role,
      addresses: user.addresses,
    }
  );
  res.status(200).json({
    message: "successfully logined",
    data: userDetails,
  });
  req.currentUser = user;
  // console.log(req.currentUser);
});
//AUTHORIZATION FOR THE PRIVATE ACCESSED PAGES PROTECT ROUTE
exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return next(new AppError("please login again", 401));
  const tokenVerified = await jwt.verify(token, process.env.SECRET_KEY);
  if (!tokenVerified)
    return next(
      new AppError(" jwt token verification failed...please login again", 403)
    );
  const userId = tokenVerified.id;
  const userExist = await User.findById(userId);
  if (!userExist) return next(new AppError("user authorization  failed", 403));
  if (userExist.isPasswordChangedAfterToken(tokenVerified.iat))
    return next(
      new AppError("User change password recently.Please login again", 403)
    );
  req.currentUser = userExist;
  next();
});

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role))
      return next(
        new AppError("you dont have permission to access this page", 403)
      );
    next();
  };
};
//  GET LOGOUT /logout
exports.logout = (req, res) => {
  if (!req.cookies.jwt) {
    // If the cookie is empty or doesn't exist, send a message saying the user is already logged out
    return res
      .status(400)
      .json({ message: "No active session. Already logged out." });
  }
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
      sameSite: "none",
  });
  res.status(200).json({ message: "Succesfully logged out " });
};
//FORGOT PASSWORD POST /forgotpassword
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError("please check your email id", 403));
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Reset your Password",
      message: `Hello ${user.name}, please click on the link to reset your password ,this link will expires after 10 min: ${resetURL}`,
    });
    res.status(201).json({
      success: "success",
      message: `please check your email:- ${user.email} to activate your account!`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(error.message, 500));
  }
});
///RESET PASSWORD PATCH /resetPassword/:resetToken
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetToken } = req.params;

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError("NO USER EXIST ON THIS RESET TOKEN", 401));
  const { newPassword } = req.body;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  res.status(203).json({ status: "Successfully Password updated", data: user });
});
//UPDATE PASSWORD  /me/updatePassword
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = req.currentUser;

  const userExist = await User.findById(user._id);
  if (!userExist)
    return next(new AppError("User doesnt exist..please login again", 401));
  if (req.body.newPassword !== req.body.passwordConfirm) {
    return next(new AppError("Password doesn't matched with each other!", 400));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully!",
  });
});
