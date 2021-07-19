//import packages
import { Request, Response } from 'express';
//Import files
import UserModel,{User} from '../models/User';
// Get all the users registered in the collection
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users: User[] = await UserModel.find();
        res.json({ users });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Get an User collection by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const id: String = req.params.id;
    try {
        const user: User | null = await UserModel.findById(id);
        res.json({ user });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
//Saves a collection
export const saveUser = async (req: Request, res: Response): Promise<void>=>{
    const { name, lastName, isFamale, access } = req.body;
    try {
        const user: User = new UserModel({ name, lastName, isFamale, access });
        await user.save();
        res.json({user, msg: 'User saved on database'});
    } catch (error) {
        res.json({ error: error }).status(500);
    }
}