import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";


dotenv.config();

const PORT=process.env.PORT || 3000;

const startServer=async ()=>{
    //mongoDB connection
    await connectDB();

    //starting server
    app.listen(PORT,()=>{
        console.log(`✅ SERVER is running on http://localhost:${PORT}`);
    })
}

startServer();

