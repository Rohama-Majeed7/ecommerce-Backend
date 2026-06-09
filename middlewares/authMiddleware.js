import jwt from "jsonwebtoken";

async function authMiddleware(req, res, next) {
  try {
    // const authHeader = req.headers.authorization;

    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({ msg: "Please login" });
    // }
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, process.env.JWT_SECRET);

    req.user = user;
    next();

  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Invalid token" });
  }
}

export default authMiddleware;
