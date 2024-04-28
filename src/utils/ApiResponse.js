export class ApiResponse{
    constructor(data,message,success=true){
        this.data=data;
        this.message=message;
        this.success=success;
        
    }
}
