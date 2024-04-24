const errorHandler=(error,req,res,next)=>{
    res.status(error.status).json({
        succsess:error.success,
        error:error.message,
    })
}

export{errorHandler}