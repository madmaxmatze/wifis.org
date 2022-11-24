export enum UserError {
    invalid = "invalid",
    invalidId = "invalidId",
    notFound = "notFound",
    emailMissing = "emailMissing"
}

// provider and id are strings because of https://www.passportjs.org/reference/normalized-profile/
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