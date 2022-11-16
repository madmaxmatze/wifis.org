export enum UserError {
    invalidId = "invalidId",
    notFound = "notFound",
    emailMissing = "emailMissing"
}

export class User {
    id: string;
    provider: string;
    providerId: string;
    email: string;
    displayName: string;
    lastLoginDate: Date;
    signupDate: Date;
    maxWifis?: number;
}