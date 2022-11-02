import { Injectable } from '@nestjs/common';
// import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(){}  // private usersService: UsersService

    validateLocalUser(username: string, _password: string) {
        var user = { id: "local", displayName: username, email: 'dummy@example.com', provider: 'local' };
        return user;
    }
}