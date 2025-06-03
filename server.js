const mongoose = require("mongoose");
const app = require("./app.js");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: ".env" });
}

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("DATABASE CONNECTION SUCCESS"))
  .catch((err) => console.log(err));
app.listen(process.env.PORT, () => {
  console.log("sever is listening on port 8000");
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
