type ActiveSessionType = {
    userId: string;
    deviceId: string;
    deviceName: string;
    ip: string;
    iat: Date;
    exp: Date;
};

export {ActiveSessionType};