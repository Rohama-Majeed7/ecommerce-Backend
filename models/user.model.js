import mongoose from "mongoose";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
    },
  },
  { timestamps: true }
);
// generateToken
userSchema.methods.generateToken = function () {
  const tokenData = {
    userId: this._id,
    username: this.username,
    email: this.email,
    profilePic: this.profilePic,
  };
  const token = jwt.sign(tokenData, "helloromi", { expiresIn: "30d" });

  return token;
};
const userModel = mongoose.model("user", userSchema);

export default userModel;
