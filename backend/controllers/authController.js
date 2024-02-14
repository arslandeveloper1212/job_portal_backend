import userModel from '../models/userModel.js'

export const registerController = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        //validate
        if (!name) {
            // return res
            //     .status(400)
            //     .send({ success: false, message: "please provide name" });
            next(" name is required")
        }
        if (!email) {
            // return res
            //     .status(400)
            //     .send({ success: false, message: "please provide email" });
            next(" email is required")
        }
        if (!password) {
            // return res
            //     .status(400)
            //     .send({ success: false, message: "please provide password" });
            next("password is required and greater than 6 character")
        }
        const exisitingUser = await userModel.findOne({ email });
        if (exisitingUser) {
            // return res
            //     .status(200)
            //     .send({ success: false, message: "Email Already Exist" })
            next("email already exist")
        }
        const user = await userModel.create({ name, email, password });
        // token 
        const token = user.createJWT();
        res.status(201).send({
            success: true,
            message: "User created successfully",
            user: {
                name: user.name,
                lastName: user.lastName,
                email: user.email,
                location: user.location,

            },
            token,
        });
    } catch (err) {

        // res.status(400)
        //     .send({
        //         message: "Error is register Controller",
        //         success: false,
        //         error: err,
        //     });
        next(err)
    }
};

export const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // validation 
        if (!email || !password) {
            next("Please provide all fields")
        }
        // find user by email 
        const user = await userModel.findOne({ email });
        if (!user) {
            next("Invalid Username or password")
        }
        //compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            next('Invalid Username or password');
        }
        const token = user.createJWT();
        res.status(201).send({
            success: true,
            message: "Login Successfully",
            user: {
                email: user.email,
            },
            token,
        })
    } catch (err) {
        next(err)
    }
}


