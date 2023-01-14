import mongoose from "mongoose"
const usersModel = new mongoose.Schema({
    id: Number,
});
const User = mongoose.model("users", usersModel);
export default User;