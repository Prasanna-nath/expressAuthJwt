import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/connectDB.js";
import transporter from "../config/emailConfig.js";

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmtion } = req.body;

    try {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length > 0) {
        res.send({ status: "failed", message: "Email already exists" });
      } else {
        if (name && email && password && password_confirmtion) {
          if (password === password_confirmtion) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            await pool.query(
              "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
              [name, email, hashPassword]
            );

            const saved_user = await pool.query(
              "SELECT * FROM users WHERE email = $1",
              [email]
            );
            // Generate token
            const token = jwt.sign(
              { userId: saved_user.rows[0].id },
              process.env.JWT_SECRET_KYE,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "success",
              message: "User registered successfully",
              token: token,
            });
          } else {
            res.send({ status: "failed", message: "Password doesn't match" });
          }
        } else {
          res.send({ status: "failed", message: "All fields are required" });
        }
      }
    } catch (error) {
      console.error(error);
      res.send({ status: "error", message: "Unable to register" });
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);

        if (user.rows.length > 0) {
          const retrievedUser = user.rows[0];
          const isMatch = await bcrypt.compare(
            password,
            retrievedUser.password
          );

          if (retrievedUser.email === email && isMatch) {
            const token = jwt.sign(
              { userId: user.rows[0].id },
              process.env.JWT_SECRET_KYE,
              { expiresIn: "5d" }
            );
            res.status(201).send({
              status: "success",
              message: "User Login successfully",
              token: token,
            });
          } else {
            res.send({
              status: "failed",
              message: "Email or password is invalid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a registered user",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.error(error);
      res.send({ status: "error", message: "Unable to Login" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmtion } = req.body;
    //console.log(req.userId);
    const userId = req.user.rows[0].id;
    if (password && password_confirmtion) {
      if (password !== password_confirmtion) {
        res.send({
          status: "failed",
          message: "Password and Confirm Password not match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await pool.query("UPDATE users SET password = $1 WHERE id = $2;", [
          newHashPassword,
          userId,
        ]);
        res.send({
          status: "success",
          message: "Password changed succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All fields are required" });
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      // console.log(user.rows[0].id);
      if (user) {
        const secret = user.rows[0].id + process.env.JWT_SECRET_KYE;
        const token = jwt.sign({ userId: user.rows[0].id }, secret, {
          expiresIn: "15m",
        });
        const link = `http://127.0.0.1:3000/api/user/reset/${user.rows[0].id}/${token}`;
        //console.log(link);
        //send email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "Password Reset Link",
          html: `<a href=${link}>Click Here</a> to Reset your password`,
        });
        res.send({
          status: "success",
          message: "Password Reset Email Send... Please Check Your Email",
          info: info,
        });
      } else {
        res.send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email field is required" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmtion } = req.body;
    const { id, token } = req.params;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const new_secret = user.rows[0].id + process.env.JWT_SECRET_KYE;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmtion) {
        if (password !== password_confirmtion) {
          res.send({
            status: "failed",
            message: "Password and confirm password doesn't match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await pool.query("UPDATE users SET password = $1 WHERE id = $2;", [
            newHashPassword,
            id,
          ]);
          res.send({
            status: "success",
            message: "Password changed succesfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fields are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };
}

export default UserController;
