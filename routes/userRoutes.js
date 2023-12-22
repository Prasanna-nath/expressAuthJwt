import Express from "express";
const router = Express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

//Rout level middleware
router.use("/changepassword", checkUserAuth);
router.get("/loggeduser", checkUserAuth);

//Public routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);
router.post(
  "/send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

//Private routes
router.post("/changepassword", UserController.changeUserPassword);
router.get("/loggeduser", UserController.loggedUser);

export default router;
