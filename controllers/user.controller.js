import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
// for sign up
const signUp = async (req, res) => {
  const { username, email, password, profilePic, role } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  //  user existence
  const userExist = await userModel.findOne({ email });
  if (userExist) {
    return res.json({ msg: "user already exists", status: 400 });
  }
  //  user creation
  const userCreated = await userModel.create({
    username,
    email,
    password: hashPassword,
    role,
    profilePic,
  });
  if (userCreated) {
    return res.json({
      status: 200,
      msg: "user created successfully",
      userCreated,
    });
  }
};
// for login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await userModel
      .findOne({ email })
      .select("+password");

    if (!userExist) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      userExist.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password",
      });
    }

    const token = await userExist.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Login Successfully",
      token,
      user: userExist,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      msg: error.message,
    });
  }
};
const userDetails = async (req, res) => {
  try {
    const id = req.user.userId;
    const user = await userModel.findById({ _id: id });

    if (user) {
      res.json({ user });
    } else {
      console.log("something wrong in authentication");
    }
  } catch (error) {
    console.log(error);
  }
};

async function userLogout(_, res) {
  try {
    res.clearCookie("token");
    res.json({
      msg: "Logged out successfully",
    });
  } catch (err) {
    console.log(err);
  }
}

async function allUsers(_, res) {
  try {
    const users = await userModel.find();

    res.json({ users: users, msg: "all users" });
  } catch (error) {
    console.log(error);
  }
}
// update User
const updateUser = async (req, res) => {
  try {
    const { userId, role } = req.body;
    console.log(role);
    const _id = userId;
    const updatedUser = await userModel.findByIdAndUpdate(_id, { role });
    if (updatedUser) {
      res.json({ user: updatedUser, msg: "user Updated" });
    }
  } catch (error) {
    console.log(error);
  }
};
export { signUp, login, userDetails, userLogout, allUsers, updateUser };
