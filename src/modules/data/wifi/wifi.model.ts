export enum WifiError {
    invalid = "invalid",
    wifiIdTooLong = "wifiIdTooLong",
    wifiIdTooShort = "wifiIdTooShort",
    noWifiIdDefined = "noWifiIdDefined",
    wifiIdReserved = "wifiIdReserved",
    wrongWifiIdChars = "wrongWifiIdChars",
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