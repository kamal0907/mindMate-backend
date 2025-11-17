import mongoose from "mongoose"; 
import 'dotenv/config'

const connectMongo = async (connectionURL) => {
    const connect = await mongoose.connect(connectionURL);
    return connect;
}

export default connectMongo;