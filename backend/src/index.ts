import express, { Request, Response } from "express";
import chatRouter from "./routes/chat.route.js";

const app = express();

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