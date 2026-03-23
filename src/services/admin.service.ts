import userModel from "../models/user.model.js"

//user creation, admin can only create user and assign role
export const createUserByAdmin=async(name:string,email:string,password:string,role:"user" | "admin")=>{
    const existingUser=await userModel.findOne({email});

    if(existingUser){
        throw new Error("User already exists");
    }

    const user=await userModel.create({
        name:name,
        email:email,
        password:password,
        role:role
    })

    return user;
}