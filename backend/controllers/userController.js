import userModel from '../models/userModel.js'

export const updateUserController = async (req, res, next) => {
    try {
        const { name, lastName, email, location } = req.body;
        if (!name || !lastName || !email || !location || email.trim() === '') {
            res.status.send({ message: "Please provide all details" })
        }
        const user = await userModel.findOne({ _id: req.user.userId })
        user.name = name;
        user.lastName = lastName;
        user.email = email;
        user.location = location;
        await user.save();
        const token = user.createJWT();
        res.status(200).send({
            user,
            token,
        })
    } catch (err) {
        next(err)
    }
}