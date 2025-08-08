import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector:Reflector,
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean>{
        try{
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(
                ROLES_KEY,[
                    context.getHandler(),
                    context.getClass()
                ]);
            if(!requiredRoles || requiredRoles.length===0){
                return true; //no role restriction
            }

            const request = context.switchToHttp().getRequest();
            const user = request.user;

            if(!user || !user.role || !user.role.name){
                throw new ForbiddenException('User Role not Found!.');
            }

            const hasRole = requiredRoles.includes(user.role.name);
            
            if(!hasRole){
                throw new ForbiddenException(
                    "You do not have permission to access this resource"
                );
            }

            return true;
        }catch(error){
            if(error instanceof ForbiddenException){
                throw error;
            }
            throw new InternalServerErrorException('Error checking user Role.')
        }
    
    }

}
