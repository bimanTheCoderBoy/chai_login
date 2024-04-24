export const asyncHandler=(func)=>{
    
  return   async(req,res,next)=>{
    Promise.resolve(await func(req,res,next)).catch((error)=>{
        next(error);
    })
}
}

// export const asyncHandler=(func)=>(req,res,next)=>{
  
//     func(req,res,next).catch((error)=>{

//     })
  
// }
