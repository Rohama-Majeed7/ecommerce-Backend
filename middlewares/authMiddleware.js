import jwt from "jsonwebtoken";

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Please login" });
    }

    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, "helloromi");

    req.user = user;
    next();

    return res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Invalid token" });
  }
}

export default authMiddleware;
