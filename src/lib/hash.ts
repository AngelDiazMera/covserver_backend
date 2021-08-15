import bcrypt from 'bcrypt'
/**
 * Hash a value with Bcrypt algorithm
 * @param value string to hash
 * @param rounds salt rounds
 */
export const hashBcrypt = async (value: string, rounds: number): Promise<string> =>  {
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(value.toString(), salt);
}