import express from 'express';
require('dotenv/config');
import {connectMongo} from './connection.js'

const app = express();

app.use(express.json());

connectMongo(process.env.MONGO_URI).then( () => {
    console.log("MongoDB connected")
})

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`)
});