// Imported packages
import { Request, Response } from 'express';
const qrcode: any =  require('qrcode');
// Imported files
import EnterpriseModel, { Enterprise } from '../models/Enterprise';
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
    const { name, enterpriseRef } = req.body;
    try {
        const enterprise: Enterprise | null = await EnterpriseModel.findById(enterpriseRef);
        if(enterprise == null){
            res.json({msg: 'Enterprise ref is not correct'});
            return;
        }
        const memberCode: String = _generateSubgroupCode(enterprise.acronym, true);
        const visitorCode: String = _generateSubgroupCode(enterprise.acronym, false);
        const groups: Groups = new GroupsModel({ name, memberCode, visitorCode, enterpriseRef });
        await groups.save();
        res.json({groups, msg: 'Group saved on database'});
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};
// Generate subgroup code
const _generateSubgroupCode = (acronym: String, isMember?: Boolean): String => {
    const max: number = 9999;
    const min: number = 1000;
    const id: number = Math.random() * (max - min) + min;
    if(isMember){
        return `M-${acronym}-${id.toString().slice(0,4)}`;
    } else {
        return `V-${acronym}-${id.toString().slice(0,4)}`;
    }
}
//Get QR CODE
export const getQR = async (req: Request, res: Response): Promise<void> => {
    const { code } = req.body;
    const dtqr:String = code;
    try {
        const QR: any = await qrcode.toDataURL(dtqr);
        res.json({ qr_base64:QR });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};


