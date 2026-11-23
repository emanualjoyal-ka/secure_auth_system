import rateLimit from "express-rate-limit";

//dynamic rate limitter 
export const createLimiter=(windowsMs:number,max:number,message:string)=>{
    return rateLimit({
        windowMs:windowsMs,
        max:max,
        message:{
            success:false,
            error:message
        },
        skip: () => process.env.NODE_ENV === "test" // since NODE_ENV changed to test in vitest.config file, ratelimitting will be disabled
    })
}