class ApiError extends Error{
    statusCode:number;
    isOperaational:boolean;
    constructor(message:string,statusCode:number){
        super(message);
        this.statusCode=statusCode;
        this.isOperaational=true;
        Error.captureStackTrace(this,this.constructor)
    }
}

export default ApiError;