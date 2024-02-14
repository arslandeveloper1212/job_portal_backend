import mongoose from "mongoose";
import jobsModel from "../models/jobsModel.js";
import moment from 'moment';


export const createJobsController = async (req, res) => {
    try {
        const { company, position } = req.body;
        console.log(req.body);
        // if (!company || !position) {
        //     res.status(400).send({ Message: "Please provide all fields" });
        // }
        // next("Please provide all fields");
        req.body.createdBy = req.user.userId;
        const job = await jobsModel.create(req.body);
        res.status(201).send({ job });
        console.log(job);

    } catch (err) {
        console.log(err);
    }


}

// Getjobscontroller 
export const getAllJobsController = async (req, res, next) => {
    const { status, workType, search, sort, workLocation } = req.query;
    //conditons for searching filters
    const queryObject = {
        createdBy: req.user.userId,
    };
    //logic filters
    if (status && status !== "all") {
        queryObject.status = status;
    }
    if (workType && workType !== "all") {
        queryObject.workType = workType;
    }

    if (search) {
        queryObject.position = { $regex: search, $options: "i" };
    }

    let queryResult = jobsModel.find(queryObject);

    //sorting
    if (sort === "latest") {
        queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "oldest") {
        queryResult = queryResult.sort("createdAt");
    }
    if (sort === "a-z") {
        queryResult = queryResult.sort("position");
    }
    if (sort === "z-a") {
        queryResult = queryResult.sort("-position");
    }
    //pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    queryResult = queryResult.skip(skip).limit(limit);
    //jobs count
    const totalJobs = await jobsModel.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    const jobs = await queryResult;


    res.status(200).json({
        totalJobs,
        jobs,
        numOfPage,
    });
};



// updatejobscontroller 

export const updateJobController = async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const { company, position } = req.body;
    // validation 
    if (!company || !position) {
        next("Please provide details")
    }
    // find job
    const job = await jobsModel.findOne({ _id: id });
    if (!job) {
        next("no jobs found with this ID")
    }
    if (!req.user.userId === job.createdBy.toString()) {
        next("Your Not Authorized to update this job");
        return;
    }
    const updateJob = await jobsModel.findOneAndUpdate({ _id: id }, req.body, {
        new: true,
        runValidators: true,
    });
    //res
    res.status(200).json({ updateJob });
}

export const deleteJobController = async (req, res, next) => {
    const { id } = req.params;
    // find job 
    const job = await jobsModel.findOne({ _id: id });
    if (!job) {
        next("No Job found with this id")
    }
    if (!req.user.userId === job.createdBy.toString()) {
        next("Your Not Authorize to delete this job");
        return;
    }
    await job.deleteOne();
    res.status(201).send({ message: "Job deleted successfully" })
}

// State and Filters //
export const jobStatsController = async (req, res, next) => {
    const stats = await jobsModel.aggregate([
        //search by user jobs
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId)
            }
        },
        {
            $group: {
                _id: "status",
                count: { $sum: 1 },
            }
        }

    ]);

    //default stats
    const defaultstats = {
        pending: stats.pending || 0,
        reject: stats.reject || 0,
        interview: stats.interview || 0

    }

    //yearly monthly stats check 
    let monthlyApplication = await jobsModel.aggregate([
        {
            $match: {
                createdBy: new mongoose.Types.ObjectId(req.user.userId)

            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },  // Reference the field createdAt
                    month: { $month: "$createdAt" } // Reference the field createdAt
                },
                count: { $sum: 1 }
            }
        }

    ])
    monthlyApplication = monthlyApplication.map((item) => {
        const { _id: { year, month }, count } = item;
        const date = moment().month(month - 1).year(year).format("MMM Y ")
        return { date, count }
    }).reverse()
    res.status(200).json({ totaljobs: stats.length, defaultstats, monthlyApplication, stats })
}