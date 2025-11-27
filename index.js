import express from 'express';
import 'dotenv/config'

// Mongo DB connection 
import connectMongo from './connection.js'

const app = express();

//Middlewares
import {authMiddleware} from './middlewares/auth.middleware.js'

//Routes
import authRouter from './routes/auth.route.js'
import diaryRouter from './routes/diary.route.js'
import gratitudeRouter from './routes/gratitude.route.js'
import chatRouter from './routes/chat.route.js'

app.use(express.json());
app.use(authMiddleware);

connectMongo(process.env.MONGO_URI).then( () => {
    console.log("MongoDB connected")
})

app.use('/auth', authRouter);
app.use('/', diaryRouter);
app.use('/',gratitudeRouter);
app.use('/',chatRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`)
});