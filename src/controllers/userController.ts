//import packages
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
//Import files
import UserModel,{User} from '../models/User';
import config from '../config/config';

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
// Private: Creates a jwt
const _createToken = (user: User) => {
    return jwt.sign({id: user.id, email: user.access.email}, config.jwtSecret);
};

// Saves an user and returns the user and the session
export const signUp = async (req: Request, res: Response): Promise<Response> =>{
    // Validate if data is completed
    if (!req.body.name || !req.body.lastName || !req.body.gender || !req.body.access.password || !req.body.access.email) 
        return res.status(400).json({msg: 'Por favor enva nombre, apellidos, género, correo y contraseña'});
    
    // Validate if a register with an specified email already exists
    const user = await UserModel.findOne({'access.email': req.body.access.email});
    if (user)
        return res.status(400).json({msg: 'El usuario con ese email ya ha sido registrado'});
    // Save the new user to database
    const { name, lastName, gender, access } = req.body;
    try {
        const newUser: User = new UserModel({ name, lastName, gender, access });
        await newUser.save();
        return res.status(200).json({
            newUser, 
            msg: 'El usuario ha sido almacenada con éxito', 
            token: _createToken(newUser), 
        });
    } catch (error) {
        return res.status(400).json({ error: error , msg: 'Hubo un problema con el registro'});
    }
};

// Generarte the JWT to sign to the app
export const signIn = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.password || !req.body.email)
        return res.status(400).json({msg: 'Por favor envíe correo electrónico y contraseña'});

    // Validate if a register with an specified email already exists
    const user: User | null = await UserModel.findOne({'access.email': req.body.email});
    if (!user)
        return res.status(400).json({msg: 'El usuario no existe'});
    // If request password and user password is the same, creates the auth token
    const isMatch = await user.comparePassword(req.body.password);
    if (isMatch)
        return res.status(200).json({
            token: _createToken(user), 
            user: {
                email: user.access.email, 
                name: user.name, 
                lastName: user.lastName,
                gender: user.gender
            }});
    
    return res.status(400).json({msg: 'El correo o la contraseña son incorrectas'});
};


export const getMyUser = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

    const userReq = req.user as User; // user from passport

    try {
        const user: User | null = await UserModel.findById(userReq.id);
        if (!user) return res.status(404).json({msg: 'No se pudo encontrar la empresa'});

        return res.json({
            email: user.access.email, 
            name: user.name, 
            lastName: user.lastName,
            gender: user.gender
        });
    } catch (error) {
        return res.json({ error: error, msg: 'Hubo un problema con el registro' }).status(400);
    }
};