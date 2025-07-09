import jwt from "jsonwebtoken";
async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;
    console.log(token);
    
    if (!token) {
      res.json({ msg: "Please Login" });
    }
    const user = jwt.verify(token, "helloromi");
    req.user = user;
    // console.log(user);
    res.json({token:token})
    next();
  } catch (error) {
    console.log(error);
  }
}
export default authMiddleware;
