// Imported packages
import { Request, Response } from 'express';
const qrcode: any =  require('qrcode');
// Imported files
import EnterpriseModel, { Enterprise } from '../models/Enterprise';
import GroupsModel, { Groups } from '../models/Groups'; 
import UserModel,{User} from '../models/User';
import { addMinutes, concatDates, formatDateToSpanish } from '../lib/dateModifiers';
//Dependencies of mongoose
import mongoose, { Number } from 'mongoose'
const {ObjectId} = mongoose.Types;

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
    const { name } = req.body;
    const entReq = req.user as Enterprise;
    const enterpriseRef = entReq.id;
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
        res.json({ error: error , msg: "Hubo un error"}).status(500);
    }
};


/**
 * Request to assign an user to a group as a `member` or a `visitor`.
 * */
 export const assignToGroup = async (req: Request, res: Response): Promise<Response> => {
    // Missing data
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});
    if (!req.body.code || !req.body.mobileToken) return res.status(400).json({msg: 'Por favor envíe código de asignación y token móvil'});
    // Match code syntax, such as `V-AC-1465` or `M-AC-9394`
    if (!req.body.code.match(/\w{1}-\w+-\d{4}/gi)) 
        return res.status(400).json({msg: 'El código no tiene la sintáxis correcta'});

    // Important variables!
    const userReq = req.user as User; // user from passport
    const token: string = req.body.mobileToken
    const code: string = req.body.code; // Code from the request
    const waiting = 5; // Minutes to wait before registering a visit again

    try {
        // Check if it is a member
        const isMember = code.startsWith('M');
        // Match group from database
        const group: Groups | null = await GroupsModel.findOne({ '$or': [{ memberCode: code }, { visitorCode: code }]});
        if (!group) return res.status(400).json({ msg: 'No se pudo encontrar el código' }); 

        if (isMember) {
            // Check if member has already been registered
            const pos = group.members?.findIndex( member => member.userRef == userReq.id);
            if (pos != -1)
                return res.status(400).json({ msg: 'Este usuario ya fue registrado en el grupo' });
            // Push member to array
            group.members?.push({ userRef: userReq.id, mobileToken: token });
        }
        else {
            const today = new Date();
            // Check if visit has already been registered in some minutes
            const pos = group.visits?.findIndex( visit => 
                visit.userRef == userReq.id &&
                visit.visitDate > addMinutes(today, -waiting));
            if (pos != -1 && addMinutes(group.visits![pos!].visitDate, waiting) > today){ 
                console.log(addMinutes(group.visits![pos!].visitDate, waiting), ' > ', today)
                return res.status(400).json({ msg: `Debe esperar al menos ${waiting} minutos para registrarse nuevamente` });
            }
            // Push visit to array
            group.visits?.push({ userRef: userReq.id, visitDate: today, mobileToken: token });
        }
        // Save group to database
        group.save();
        return res.json({ group, msg: 'Usuario asignado' });
    } catch (error) {
        return res.status(400).json({ error: error, msg: 'Hubo un problema con la asignación' });
    }
}
 
// Get all the groups of an specific ID
export const getUsersByToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const users: User[] = await UserModel.find();
        console.log("Data de tokenMovil" + UserModel);
        res.json({ users });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
};

const  getCodesOfUser = (user: User) => {
     //gg
} 