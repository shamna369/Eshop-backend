const express = require("express");
const { Router } = require("express");
const router = express.Router();
const {
  authUser,
  registerUser,
  protect,
  restrictTo,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController.js");
const {
  getUserDetails,
  getUserDetailsById,
  updateUserProfile,
  postAddress,
  deleteUserAddress,
  getAllUser,
} = require("../controllers/userController.js");
const { uploadUserPhoto } = require("../utilis/userImageUpload.js");
/////////////////////
//////////////////////
router.post("/register", uploadUserPhoto, registerUser);
router.post("/login", authUser);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:resetToken", resetPassword);
router.get("/all-users", getAllUser);
//must be protected route
/////////////////
router.use(protect);
router.get("/getuser", protect, getUserDetails);
router.patch("/update-user-info", uploadUserPhoto, updateUserProfile);
router.patch("/me/updatePassword", protect, updatePassword);
router.patch("/delete-user-address/:id", deleteUserAddress);
// router.get("/getuser/:id", restrictTo("admin"), getUserDetailsById);
router.get("/getuser/:id", getUserDetailsById);
router.post("/add-user-address", protect, postAddress);

module.exports = router;
