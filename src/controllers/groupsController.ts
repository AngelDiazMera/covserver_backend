// Imported packages
import { Request, Response } from 'express';
// Imported files
import GroupsModel, { Groups } from '../models/Groups';

// Get all the groups registered in the collection
export const getGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        const groups: Groups[] = await GroupsModel.find();
        res.json({ groups });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Get an group collection by ID
export const getGroupById = async (req: Request, res: Response): Promise<void> => {
    const id: String = req.params.id;
    try {
        const groups: Groups | null = await GroupsModel.findById(id);
        res.json({ groups });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Saves a group collection
export const saveGroup = async (req: Request, res: Response): Promise<void> => {
    const { name, code, members, enterpriseRef, visits } = req.body;
    try {
        const groups: Groups = new GroupsModel({ name, code, members, enterpriseRef, visits });
        await groups.save();
        res.json({groups, msg: 'Group saved on database'});
    } catch (error) {
        res.json({ error: error }).status(500);
    }
}
