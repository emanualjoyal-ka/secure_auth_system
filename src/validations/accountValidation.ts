import Joi from "joi";

export const resendVerificationTokenValidation=Joi.object({email:Joi.string().email().required()}).unknown(false);

export const forgotPasswordValidation=Joi.object({email:Joi.string().email().required()}).unknown(false);

export const resetPasswordValidation=Joi.object({
    token:Joi.string().required(),
    newPassword:Joi.string().min(6).required(),
    confirmPassword:Joi.any().valid(Joi.ref("newPassword")).required()
}).unknown(false);