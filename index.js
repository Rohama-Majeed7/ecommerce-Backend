import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import userRouter from "./routes/user.route.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import wishlistRouter from "./routes/wishList.route.js";
import reviewRouter from "./routes/review.route.js";
import chatRouter from "./routes/chat.route.js"
const app = express();
app.use(
  cors({
    origin: "https://ecommerce-frontend-blond-five.vercel.app",
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json());
// app.use(express.urlencoded());
app.get("/",(_,res) =>{
  res.send("Backend is running")
})
const PORT = 8080 || process.env.PORT;
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.use("/wishlistApi", wishlistRouter);
app.use("/review", reviewRouter);
app.use("/chat", chatRouter);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("connected to DB");
    console.log(`server is runing on port ${PORT}`);
  });
});
