import mongoose from "mongoose";
import typeOfUsers from "../utils/constants"
var userSchema = mongoose.Schema({
    userId : {
        type : Number,
        trim : true,
        default : null
    },
    userType : {
        type : String,
        enum : typeOfUsers,
        default : "innovator",
    },
    email : {
        type : String,
        required : true,
        trim : true,
        match : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    verified : {
        type : Boolean,
        required : true,
        default : false
    },
    name : {
        type : String,
        required : true,
        trim : true,
        maxLength : 10,
        minLength : 5,
        default : null
    }
} , {timeStamp : true});

var userModel = mongoose.model("user" , userSchema);
export default userModel;