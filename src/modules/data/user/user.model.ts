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
    name: string;
    lastLoginDate: Date;
    signupDate: Date;
    maxWifis?: number;
    country?: string;
    city?: string;
}