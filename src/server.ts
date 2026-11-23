import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import swaggerUi from "swagger-ui-express";
import loadSwaggerDocument from "./config/swagger.js";
import { env } from "./config/env.js";

dotenv.config();
const PORT=env.PORT || 3000;

const startServer=async ()=>{
    const swaggerDocument = await loadSwaggerDocument();

    // Setup Swagger UI
    app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocument));

    //mongoDB connection
    await connectDB();

    //starting server
    app.listen(PORT,()=>{
        console.log(`SERVER is running on http://localhost:${PORT}`);
    })
}

startServer();

