// Imported packages
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
// Imported files
import EnterpriseModel, { Enterprise } from '../models/Enterprise'
import config from '../config/config'

// Get all the enterprises registered in the collection
export const getEnterprises = async (req: Request, res: Response): Promise<void> => {
    try {
        const enterprises: Enterprise[] = await EnterpriseModel.find();
        res.json({ enterprises });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Get an Enterprise collection by ID
export const getMyEnterprise = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

    const entReq = req.user as Enterprise;

    try {
        const enterprise: Enterprise | null = await EnterpriseModel.findById(entReq.id);
        if (!enterprise) return res.status(404).json({msg: 'No se pudo encontrar la empresa'});

        return res.json({
            email: enterprise.access.email, 
            name: enterprise.name, 
            acronym: enterprise.acronym
        });
    } catch (error) {
        return res.json({ error: error, msg: 'Hubo un problema con el registro' }).status(400);
    }
};

// Saves a collection
export const signUp = async (req: Request, res: Response): Promise<Response> => {
    // Validate if data is completed
    if (!req.body.name || !req.body.acronym || !req.body.access.password || !req.body.access.email)
        return res.status(400).json({msg: 'Por favor enva nombre, acrónimo, correo y contraseña'});
    // Validate if a register with an specified email already exists
    const enterprise = await EnterpriseModel.findOne({'access.email': req.body.access.email});
    if (enterprise)
        return res.status(400).json({msg: 'La empresa con ese email ya ha sido registrada'});
    // Save the new enterprise to database
    const { name, acronym, access } = req.body;
    try {
        const newEnterprise: Enterprise = new EnterpriseModel({ name, acronym, access });
        await newEnterprise.save();
        return res.status(200).json({newEnterprise, msg: 'La empresa ha sido almacenada con éxito'});
    } catch (error) {
        return res.status(400).json({ error: error , msg: 'Hubo un problema con el registro'});
    }
}

// Private: Creates a jwt
const _createToken = (enterprise: Enterprise) => {
    return jwt.sign({id: enterprise.id, email: enterprise.access.email}, config.jwtSecret,{
        expiresIn: 14 * 24 * 60 * 60 // Expires in 14 days
    });
}

// Generarte the JWT to sign to the app
export const signIn = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.password || !req.body.email)
        return res.status(400).json({msg: 'Por favor envíe correo electrónico y contraseña'});

    // Validate if a register with an specified email already exists
    const enterprise: Enterprise | null = await EnterpriseModel.findOne({'access.email': req.body.email});
    if (!enterprise)
        return res.status(400).json({msg: 'El usuario no existe'});
    // If request password and enterprise password is the same, creates the auth token
    const isMatch = await enterprise.comparePassword(req.body.password);
    if (isMatch)
        return res.status(200).json({
            token: _createToken(enterprise), 
            enterprise: {
                email: enterprise.access.email, 
                name: enterprise.name, 
                acronym: enterprise.acronym
            }});
    
    return res.status(400).json({msg: 'El correo o la contraseña son incorrectas'});
}

// Check wether the email is available or not
export const isEmailUnique = async (req: Request, res: Response): Promise<void> => {
    const email: String = req.params.email;
    try {
        const enterprises: Enterprise[] = await EnterpriseModel.find({'access.email': email});
        if (enterprises.length > 0)
            res.json({msg: 'El email se encuentra ocupado', val: false});
        else
            res.json({msg: 'Email disponible', val: true});
        
    } catch (error) {
        res.json({ error: error , msg: 'Hubo un problema con la consulta'}).status(500);
    }
}
// Update data
export const updateEnterprise = async (req: Request, res: Response): Promise<void> => {
    if (!req.body) {
        res.json({msg: 'Los campos no pueden estar vacios!'}).status(400);
    }
    const entReq = req.user as Enterprise;
    try{
        const enterprise: Enterprise | null = await EnterpriseModel.findByIdAndUpdate(entReq.id,req.body, { useFindAndModify: false });
        if (!enterprise) {
            res.status(404).json({
                message: `No se puede actualizar el dato con el id: ${entReq.id}`
            });
        } else res.json({ message: "Datos actualizados exitosamente!" });
    } catch (error){
        res.status(500).json({error});
    }
}