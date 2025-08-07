import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class JwtAuthGuard implements CanActivate{
    constructor(
        private jwtService: JwtService
        ,private config:ConfigService,
        @InjectRepository(User)
        private userRep:Repository<User>
    ){}

    async canActivate(context: ExecutionContext):Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const authHeader = request.headers['authorization'];
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new UnauthorizedException('Missing or malformed token!');
        }
        const token = authHeader.split(' ')[1];
        try{
            const payload = await this.jwtService.verifyAsync(token,{
                secret:this.config.get<string>('JWT_SECRET'),
            });
        
        
        const user = await this.userRep.findOne({
            where:{id:payload.sub},
        })
        
        if(!user){
            throw new UnauthorizedException('User NOT Found');
        }
        request['user'] = user;
        return true;
        }catch(err){
        throw new UnauthorizedException('Invalid or expired token');
    }
    }
}