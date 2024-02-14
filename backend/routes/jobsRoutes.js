
import express from "express";

import userAuth from "../middlewares/authMiddleware.js";
import { createJobsController, deleteJobController, getAllJobsController, jobStatsController, updateJobController } from "../controllers/jobsController.js";



const router = express.Router();

// post for create-job
router.post("/create-job", userAuth, createJobsController)

//get for all create-job that entered into the database;
router.get("/get-job", userAuth, getAllJobsController)


//update job
router.patch("/update-job/:id", userAuth, updateJobController)


//delete job
router.delete("/delete-job/:id", userAuth, deleteJobController)


// job-stat
router.get("/job-stats", userAuth, jobStatsController)

export default router;