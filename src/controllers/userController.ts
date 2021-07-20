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
export const signUp = async (req: Request, res: Response): Promise<Response> =>{
    // Validate if data is completed
    if (!req.body.name || !req.body.lastName || req.body.isFamale === undefined || !req.body.access.password || !req.body.access.email) 
        return res.status(400).json({msg: 'Por favor enva nombre, apellidos, género, correo y contraseña'});
    
    // Validate if a register with an specified email already exists
    const user = await UserModel.findOne({'access.email': req.body.access.email});
    if (user)
        return res.status(400).json({msg: 'El usuario con ese email ya ha sido registrado'});
    // Save the new user to database
    const { name, lastName, isFamale, access } = req.body;
    try {
        const newUser: User = new UserModel({ name, lastName, isFamale, access });
        await newUser.save();
        return res.status(200).json({newUser, msg: 'El usuario ha sido almacenada con éxito'});
    } catch (error) {
        return res.status(400).json({ error: error , msg: 'Hubo un problema con el registro'});
    }
}