import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export const passwordUtil = {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },
};

export default passwordUtil;
