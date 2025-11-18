import User from '../models/user.model.js'

export async function getUserByEmail (email) {
    const exisitingUser = await User.findOne({email});
    return exisitingUser;
}