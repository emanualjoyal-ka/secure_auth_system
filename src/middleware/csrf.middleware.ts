import csrf from "csurf";


export const csrfProtection=csrf({         //prevents csrf(Cross-Site Request Forgery) attacks
    cookie:{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:process.env.NODE_ENV === "production" ? "none" : "strict"
    }
})