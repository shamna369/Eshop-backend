const express = require("express");
const app = express();
const mongoose = require("mongoose");

const Product = require("../models/productModel.js");
const db_URL =
  "mongodb+srv://shamnapm369:Kimnana%40123@shamnaclustor.vlleqqa.mongodb.net/ESHIP?retryWrites=true&w=majority&appName=shamnaClustor";
const url = "https://dummyjson.com/products?limit=100";
let data;
//database connection
let productData = [];

mongoose
  .connect(db_URL)
  .then((res) => console.log("successfully connected to mongodb"))
  .catch((err) => console.log(err));

//fetch data from the api
const fetchData = async function () {
  try {
    const res = await fetch(url);
    data = await res.json();
    console.log(data);
    if (data && Array.isArray(data.products) && data.products.length > 0) {
      data.products.forEach((element) => {
        const {
          title: name,
          description,
          category,
          price: originalPrice,
          discountPercentage: discountPrice,
          stock,
          rating: ratings,
          images,
          reviews,
          brand: shopId,
        } = element;
        const newObj = {
          name,
          description,
          category,
          originalPrice,
          discountPrice,
          stock,
          ratings,
          images,
          shopId: 0,
          reviews,
        };
        productData.push(newObj);
      });
    }
  } catch (err) {
    console.log(err);
    console.log("error in fetch data from api");
  }
};

//upload these data into database
const importData = async () => {
  try {
    const dbdata = await Product.create(productData);

    console.log("Data successfully imported to Database");
  } catch (err) {
    console.log(err);
  }
};
const startApp = async () => {
  await fetchData();
  await importData();
  process.exit();
};
startApp();

//server listen
app.listen(3000, () => {
  console.log("server listen on port 8000");
});
