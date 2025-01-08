import bcrypt from 'bcrypt'

const bcryptServices = {
    async generateHash(password: string) {
        const salt = await bcrypt.genSalt(10);

        return bcrypt.hash(password, salt);
    }
};

export {bcryptServices};