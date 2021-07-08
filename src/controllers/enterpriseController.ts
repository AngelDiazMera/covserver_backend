// Imported packages
import { Request, Response } from 'express';
// Imported files
import EnterpriseModel, { Enterprise } from '../models/Enterprise';

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
export const getEnterpriseById = async (req: Request, res: Response): Promise<void> => {
    const id: String = req.params.id;
    try {
        const enterprise: Enterprise | null = await EnterpriseModel.findById(id);
        res.json({ enterprise });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Saves a collection
export const saveEnterprise = async (req: Request, res: Response): Promise<void> => {
    const { name, acronym, access } = req.body;
    try {
        const enterprises: Enterprise[] = await EnterpriseModel.find({'access.email': access.email});
        if (enterprises.length > 0){
            res.json({msg: 'El email se encuentra duplicado'}).status(500);
            return;
        }

        const enterprise: Enterprise = new EnterpriseModel({ name, acronym, access });
        await enterprise.save();
        res.json({enterprise, msg: 'La empresa ha sido almacenada con éxito'});
    } catch (error) {
        res.json({ error: error , msg: 'La empresa ha sido almacenada con éxito'}).status(500);
    }
}
