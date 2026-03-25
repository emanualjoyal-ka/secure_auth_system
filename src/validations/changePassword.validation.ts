import Joi from "joi";


export const changePasswordValidation=Joi.object({
    currentPassword:Joi.string().required(),
    newPassword:Joi.string().min(6).required(),
    confirmPassword:Joi.any().valid(Joi.ref("newPassword")).required()
})