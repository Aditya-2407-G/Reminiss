import mongoose from "mongoose";
import { DB_NAME } from "../constants/constant.js";

const connectDB = async () => {

    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`Mongo connection success DB Host ${connectionInstance.connection.host}`);

    } catch (error) {
        console.log("MongoDB connection failed.", error);
        process.exit(1);
    }

}

export default connectDB;
