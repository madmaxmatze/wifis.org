import { Injectable } from '@nestjs/common';
// import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(){}  // private usersService: UsersService

    validateUser(username: string, passowrd: string) {
        var user = { id: "local", displayName: username, email: 'dummy@example.com', provider: 'local' };
        return user;
    }
}