import type { Request, Response, NextFunction } from "express"; 
import type { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema) => { return (req: Request, res: Response, next: NextFunction) => { const { error, value } = schema.validate(req.body, { abortEarly: true, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0]?.message
        });
    }
    req.body = value;
    next();
};
};

export default validate;