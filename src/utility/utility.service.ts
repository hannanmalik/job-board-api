import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";



@Injectable()
export class UtilsService{
//Ensure Entity Exists or throw Not Found Exception
ensureExists(entity:any,entityName:String){
    if(!entity){
        throw new NotFoundException(`${entityName} not found.`)
    }
    return true;
}
//Ensure OwnerShip of an entity
ensureOwnerShip(entityOwnerId:string|number,currentUserId:string|number){
    if(entityOwnerId !== currentUserId){
        throw new ForbiddenException('You do not own this resource.');
    }
    return true;
}

//validate pagination params
validatePagination(page:number,limit:number){
    if(page<1||limit<1){
        throw new BadRequestException('Page And Limit must be positive integers.');
    }
return true;
}

// Standard success response

success(message:string,data: any = null){
    return{
        success:true,
        message,
        data
    };
}

//Standard Failure Response
failure(message:string,data:any=null){
    return{
        success:false,
        message,
        data
    };
}

}