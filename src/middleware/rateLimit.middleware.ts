import rateLimit from "express-rate-limit";

//dynamic rate limitter 
export const createLimiter=(windowsMs:number,max:number,message:string)=>{
    return rateLimit({
        windowMs:windowsMs,
        max:max,
        message:{
            success:false,
            error:message
        }
    })
}