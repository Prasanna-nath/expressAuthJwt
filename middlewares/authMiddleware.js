import jwt from "jsonwebtoken";
import pool from "../config/connectDB.js";

var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      // Get Token From Header
      token = authorization.split(" ")[1];
      //console.log(token);
      // Verify Token
      const { userId } = jwt.verify(token, process.env.JWT_SECRET_KYE);
      //console.log(userId);
      //Get user from token
      req.user = await pool.query("SELECT * FROM users WHERE id = $1;", [
        userId,
      ]);

      // Remove password from the user object
      if (req.user.rows[0]) {
        delete req.user.rows[0].password;
      }
      //console.log(req.user.rows[0]);

      next();
    } catch (error) {
      console.log(error);
      res.status(401).send({ status: "failed", message: "Unauthorized User" });
    }
  }
  if (!token) {
    res
      .status(401)
      .send({ status: "failed", message: "Unauthorized User, No Token" });
  }
};

export default checkUserAuth;
