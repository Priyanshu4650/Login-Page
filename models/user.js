const { default: mongoose } = require("mongoose");

const mongoURL = "mongodb+srv://admin:test1234@nodelearning.lvzfb5p.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoURL);
const db = mongoose.connection;
db.on('err', console.error.bind(console, "mongoose connection error"));

const Schema = mongoose.Schema;

const User = mongoose.model(
    "User",
    new Schema({
        username: { type: String, required: true },
        password: { type: String, required: true }
    })
);

module.exports = User;