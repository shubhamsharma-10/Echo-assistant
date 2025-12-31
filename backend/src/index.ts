import express, { Request, Response } from "express";
import chatRouter from "./routes/chat.route.js";
import cors from 'cors';
const app = express();

// Enable CORS for frontend
app.use(cors());
app.use(express.json());
app.use('/api', chatRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        msg: "Welcome to the server"
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})