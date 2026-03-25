import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../interfaces/IUser.js";


const userSchema=new mongoose.Schema<IUser>({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true //avoid duplicate because of case differences
    },
    password:{
        type:String,
        required:true,
        select:false, //password never returns when this model is called, should explicitly use '.select("+password")' to get password
        minlength:6
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    loginAttempts:{
        type:Number,
        default:0
    },
    lockUntil:{
        type:Date
    },
    passwordChangedAt:{
        type:Date
    }
},
{
    timestamps:true
});

//password hash
userSchema.pre<IUser>("save",async function (){
    if(!this.isModified("password")) return; //prevents rehashing an already hashed password
    this.password=await bcrypt.hash(this.password,12);  //hashing password
    this.passwordChangedAt=new Date(); //password change date
});

//custom method 'comparePassword' for password comparing
userSchema.methods.comparePassword=async function (this:IUser,enteredPassword:string){
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.set("toJSON",{ // toJSON returns clean object with only fields we want to send as response in controller
    transform:(_doc,ret:any)=>{ // "_" infornt of doc signals that it intentionally unused
        return{
            id:ret._id,
            name:ret.name,
            email:ret.email,
            role:ret.role
        }
    }
});

export default mongoose.model<IUser>("User",userSchema);