import { userRequestDto } from "../dtos/auth.dto/userRequestDto.js";
import userModel from "../models/user.model.js"


export const authRepository={
    getUser:(email:string)=>{
        return userModel.findOne({email})
    },
    createUser:(user:userRequestDto)=>{
       return userModel.create({
                name:user.name,
                email:user.email,
                password:user.password
        });
    },
}