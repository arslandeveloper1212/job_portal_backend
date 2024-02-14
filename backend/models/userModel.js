import mongoose from "mongoose";
import validator from "validator";
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';

//schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name Is Require"],
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, " Email is Require"],
      unique: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      required: [true, "password is require"],
      minlength: [6, "Password length should be greater than 6 character"],
      // select: true,
    },
    location: {
      type: String,
      default: "India",
    },
  },
  { timestamps: true }
);


//middleware 
userSchema.pre("save", async function () {
  if (!this.isModified) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

//compare password
userSchema.methods.comparePassword = async function (userPassword) {
  // Ensure userPassword is a string
  if (typeof userPassword !== 'string') {
    return false; // or throw an error if necessary
  }

  // Check if this.password exists
  if (!this.password) {
    return false; // or handle appropriately
  }

  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
}

// JSON WEBtoken 
userSchema.methods.createJWT = function () {
  return JWT.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  })
}

export default mongoose.model("User", userSchema);