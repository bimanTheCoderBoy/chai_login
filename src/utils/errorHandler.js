const errorHandler=(error,req,res,next)=>{
    res.status(error.status||500).json({
        succsess:error.success||false,
        error:error.message,
    })
}

export{errorHandler}