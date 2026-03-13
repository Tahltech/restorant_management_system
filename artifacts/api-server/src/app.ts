import express, { type Express } from "express";
import cors from "cors";
import router from "./routes/index.js";

const app: Express = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", router);

export default app;
