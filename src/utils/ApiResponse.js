export class ApiResponse{
    constructor(data,success=true,status){
        this.data=data;
        this.success=success;
        this.status=status? status :'done';
    }
}
