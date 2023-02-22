export enum WifiError {
    invalid = "invalid",

    tooLong = "tooLong",
    tooShort = "tooShort",
    valueMissing = "valueMissing",
    patternMismatch = "patternMismatch",

    wifiIdReserved = "wifiIdReserved",
    userIdMissing = "userIdMissing",
    otherUsersWifi = "otherUsersWifi",
    maxWifiCountReached = "maxWifiCountReached",
    whileWifiDelete = "whileWifiDelete",
    labelMismatch = "labelMismatch"
}

export class Wifi {
    id: string;
    label?: string;
    creationDate: Date;
    userId: string;
}