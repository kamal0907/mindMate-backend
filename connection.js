import mongoose from "mongoose"; 

const connectMongo = async (connectionURL) => {
    const connect = await connect.mongoose(connectionURL);
    return connect;
}

export default connectMongo;