import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRoutes from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`app running at url http://localhost:${PORT}`);
});
