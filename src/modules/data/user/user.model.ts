export enum UserError {
    invalidId = "invalidId"
}

export class User {
    id: string;
    provider: string;
    providerId?: string;
    email: string;
    displayName: string;
    lastLoginDate?: Date;
    signupDate?: Date;
    maxWifis?: number;
}