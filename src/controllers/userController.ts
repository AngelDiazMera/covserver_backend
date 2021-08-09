//import packages
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
//Import files
import UserModel,{ HealthCondition, User } from '../models/User';
import config from '../config/config';
import GroupsModel, { Groups } from '../models/Groups';
import { addMinutes } from '../lib/dateModifiers';

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
    return jwt.sign({id: user.id, email: user.access.email, type: 'mobile'}, config.jwtSecret);
};

// Saves an user and returns the user and the session
export const signUp = async (req: Request, res: Response): Promise<Response> =>{
    // Validate if data is completed
    if (!req.body.name || !req.body.lastName || !req.body.gender || !req.body.access.password || !req.body.access.email || !req.body.mobileToken) 
        return res.status(400).json({msg: 'Por favor envía tóken móvil, nombre, apellidos, género, correo y contraseña'});
    
    // Validate if a register with an specified email already exists
    const user = await UserModel.findOne({'access.email': req.body.access.email});
    if (user)
        return res.status(400).json({msg: 'El usuario con ese email ya ha sido registrado'});
    // Save the new user to database
    const { name, lastName, gender, access, mobileToken} = req.body;
    try {
        const mobileTokens: string[] = [mobileToken];
        const newUser: User = new UserModel({ name, lastName, gender, access, mobileTokens});
        await newUser.save();
        return res.status(200).json({
            newUser, 
            msg: 'El usuario ha sido almacenada con éxito', 
            token: _createToken(newUser), 
        });
    } catch (error) {
        console.log(error)
        return res.status(400).json({ error: error , msg: 'Hubo un problema con el registro'});
    }
};

// Generarte the JWT to sign to the app
export const signIn = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.password || !req.body.email || !req.body.mobileToken)
        return res.status(400).json({msg: 'Por favor envíe token móvil, correo electrónico y contraseña'});

    // Validate if a register with an specified email already exists
    const user: User | null = await UserModel.findOneAndUpdate(
        { 'access.email': req.body.email }, 
        { '$addToSet': { 'mobileTokens': req.body.mobileToken } },
        { new: true });
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
/**
 * Updates the health condition of the user.
 * @param req must have a healthCondition string
 * @returns a json Response object
 */
export const updateHealthCondition = async (req: Request, res: Response): Promise<Response> => {
    // Validations if data is missing
    if (!req.body.healthCondition) return res.status(400).json({msg: 'Falta healthCondition'});
    if (!req.user) return res.status(400).json({msg: 'La referencia del usuario es incorrecta'});
    if (!Object.values(HealthCondition).includes(req.body.healthCondition)) 
        return res.status(400).json({msg: 'El valor proporcionado para healthCondition debe ser uno de los siguientes: healthy, risk o infected'});
    // User from passport (auth methods)
    const userReq = req.user as User; // user from passport
    const healthCondition = req.body.healthCondition as HealthCondition;

    try {
        var isUpdated: boolean = true; // Handle if document is updated
        // Update query
        UserModel.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(userReq.id) }, 
            { $set: { healthCondition: healthCondition }},
            { new: true, upsert: true },
            function (err, doc) { if (err) isUpdated = false; });
        // If updated, return status 200 and message
        if (isUpdated)
            return res.json({msg: 'El estado se actualizó correctamente'});
        // else, returns status 400 and message
        return res.status(400).json({ msg: 'Hubo un problema con la actualización' });
    } catch (error) {
        return res.status(400).json({ error, ...{ msg: 'Hubo un problema con el registro'} });
    }
};