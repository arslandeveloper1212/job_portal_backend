// packages imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

// files imports
import connectDB from "./config/db.js";

//security packages
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
// route imports 
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import jobsRoutes from './routes/jobsRoutes.js'
import errorMiddleware from "./middlewares/errorMiddleware.js";

//port
const port =
    process.env.PORT || 8202

//Dot ENV config
dotenv.config({ path: "./config.env" });

// mongodb connection
connectDB();

//rest object
const app = express();

//middelwares
// security middleware start 
app.use(helmet());
// helmet detail : secure the header section for all data with helmet 
app.use(mongoSanitize());
// security middleware end
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

//routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/user", userRoutes)
app.use("/api/v1/job", jobsRoutes)

// middleware folder 
app.use(errorMiddleware)

//listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
