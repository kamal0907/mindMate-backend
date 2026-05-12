import express from 'express';
import cors from 'cors';
import 'dotenv/config'

// Mongo DB connection 
import connectMongo from './connection.js'

const app = express();

//Middlewares
import { authMiddleware } from './middlewares/auth.middleware.js'

//Routes
import authRouter from './routes/auth.route.js'
import diaryRouter from './routes/diary.route.js'
import gratitudeRouter from './routes/gratitude.route.js'
import chatRouter from './routes/chat.route.js'
import aiRouter from './routes/ai.route.js'

app.use(cors({
    origin: 'http://localhost:3000' || 'https://mind-mate-rosy.vercel.app',
    credentials: true
}));
app.use(express.json());
app.use(authMiddleware);

connectMongo(process.env.MONGO_URI).then(() => {
    console.log("MongoDB connected")
})


app.use('/auth', authRouter);
app.use('/ai', aiRouter);
app.use('/', diaryRouter);
app.use('/', gratitudeRouter);
app.use('/', chatRouter)

app.listen(process.env.PORT, () => {
    console.log(`Server is running on ${process.env.PORT}`)
});