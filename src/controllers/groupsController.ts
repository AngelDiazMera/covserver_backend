// Imported packages
import { Request, Response } from 'express';
const qrcode: any =  require('qrcode');
// Imported files
import EnterpriseModel, { Enterprise } from '../models/Enterprise';
import GroupsModel, { Groups } from '../models/Groups';
import UserModel, { User } from '../models/User';
import { addMinutes, concatDates, formatDateToSpanish } from '../lib/dateModifiers';
// Due to the observer pattern
import { GroupSubject, MemberObserver, VisitorObserver } from '../logic/notifiers';
import GroupSubjects from '../logic/groupSubjects';
import { Subject } from '../logic/observer';
import { PushNotification } from '../middlewares/fcmNotifications';
//Dependencies of mongoose
import mongoose, { Number } from 'mongoose'
const { ObjectId } = mongoose.Types;

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
export const getGroupByCode = async (req: Request, res: Response): Promise<Response> => {
    const code: String = req.params.code.toUpperCase();
    try {
        const group: Groups | null = await GroupsModel.findOne({ $or: [
            { memberCode: code }, { visitorCode: code } 
        ]});
        if (!group) 
            return res.status(400).json({ msg: 'No se pudo encontrar el código' }); 
        return res.json({ group });
    } catch (error) {
        return res.status(500).json({ error: error });
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
        const concatName:string = `${entReq.name} - ${name}`;
        const memberCode: String = _generateSubgroupCode(enterprise.acronym, true);
        const visitorCode: String = _generateSubgroupCode(enterprise.acronym, false);
        const groups: Groups = new GroupsModel({ name, concatName, memberCode, visitorCode, enterpriseRef });
        await groups.save();
        // Save subject due to notification purposes
        GroupSubjects.addToSet(groups.id, new GroupSubject(name));
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
            // Save subject due to notification purposes
            const groupSbj:Subject | undefined = GroupSubjects.getSubject(group.id);
            groupSbj?.attach(new MemberObserver(userReq.id, token)); // TODO: Change to token
        }
        else {
            const today = new Date();
            // Check if visit has already been registered in some minutes
            const pos = group.visits?.findIndex( visit => 
                visit.userRef == userReq.id &&
                visit.visitDate > addMinutes(today, -waiting));
            if (pos != -1 && addMinutes(group.visits![pos!].visitDate, waiting) > today){ 
                return res.status(400).json({ msg: `Debe esperar al menos ${waiting} minutos para registrarse nuevamente` });
            }
            // Push visit to array
            group.visits?.push({ userRef: userReq.id, visitDate: today, mobileToken: token });
            // Save subject due to notification purposes
            const groupSbj:Subject | undefined = GroupSubjects.getSubject(group.id);
            groupSbj?.attach(new VisitorObserver(userReq.id, token, today)); // TODO: Change to token
        }
        // Save group to database
        group.save();
        return res.json({ group, msg: 'Usuario asignado' });
    } catch (error) {
        return res.status(400).json({ error: error, msg: 'Hubo un problema con la asignación' });
    }
}

/**
 * Notify to visitors and members who may have had been with the infected user
*/
export const notifyInfected = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.anonym == null || !req.body.symptomsDate || !req.body.mobileToken) 
        return res.status(400).json({msg: 'Por favor envíe anonym, mobileToken y symptomsDate'});
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

    const userReq = req.user as User; // user from passport
    const token = req.body.mobileToken;

    try {
        console.log('Recibido: ', {anonym: req.body.anonym, symptomsDate: req.body.symptomsDate})
        // Parses date from client
        const parsedDate = Date.parse(req.body.symptomsDate);
        const date = new Date(parsedDate);
        // Message of FCM push notification
        const message: PushNotification = {
            data: {
                userRef: userReq.id,
                anonym: `${req.body.anonym}`,
                symptomsDate: `${formatDateToSpanish(date)}`
            },
            notification: {
                title: 'Alerta de infección',
                body: ''
            }
        };
        // Filter subjects
        const allSubjects = GroupSubjects.getInstance();
        const visitorSubjects = await GroupSubjects.searchWhereId(userReq.id);
        var matchedSubjects = GroupSubjects.joinInfectedAndGlobal(visitorSubjects, allSubjects);

        // Notify related subjects
        for (const [id, group] of matchedSubjects as Map<string,GroupSubject>) 
            group.registerInfected(
                new VisitorObserver(userReq.id, token, new Date()), message);
        
        // TODO: Implement update for health state of the user to 'infected'
        return res.json({msg: 'El mensaje se envió satisfactoriamente'});
    } catch (error) {
        console.log(error)
        return res.json({error: error, msg: 'Hubo un problema con el envío'});
    }
}
////////////////////////////////////////////////////////////////////////////////////////
export const getAlertData = async (req: Request, res: Response): Promise<Response> => {
    if (req.body.anonym == null || !req.body.userRef || !req.body.groupRef || !req.body.mobileToken) 
        return res.status(400).json({msg: 'Por favor envíe anonym, mobileToken, userRef y groupRef'});
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

    const userReq = req.user as User; // user from passport

    try {
        const user = await UserModel.findById(req.body.userRef);
        const group = await GroupsModel.findById(req.body.groupRef);

        const allSubjects = GroupSubjects.getInstance(),
        subjects = await GroupSubjects.searchWhereId(userReq.id),
        matchedSubjects = GroupSubjects.joinInfectedAndGlobal(subjects, allSubjects),
        visitorSubjects = matchedSubjects as Map<string, GroupSubject>;

        const datesMap = GroupSubject.makeTokenArrayByDate(visitorSubjects.get(req.body.groupRef)?.visits!);
        
        var joinDates:Date[] = [];
        for (const [token, dates] of datesMap) 
            joinDates = [...joinDates, ...dates];
        

        return res.json({
            ...(!req.body.anonym && {completeName: `${user?.name} ${user?.lastName}`}),
            groupName: group?.name,
            dates: concatDates(joinDates)
        });
    } catch (error) {
        console.log(error)
        return res.json({error: error, msg: 'Hubo un problema con el envío'});
    }
}
 ////////////////////////////////////////////////////////////////////////////////////////
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

// Delete group assignation of a user
export const deleteUserFromGroup = async (req: Request, res: Response): Promise<void> => {
    const userRef: string = req.body.userRef;
    const code: string = req.body.code;
    
    try {
        const isMember = code.startsWith('M');
        if(isMember){
            const group: Groups | null = await GroupsModel.findOneAndUpdate(
                { memberCode: code },
                { $pull: { members: { userRef: userRef } } }
            );
            res.json({ group, msg: 'Usuario eliminado del grupo' });
        } else {
            const group: Groups | null = await GroupsModel.findOneAndUpdate(
                { visitorCode: code },
                { $pull: { visits: { userRef: userRef } } }
            );
            res.json({ group, msg: 'Usuario eliminado del grupo' });
        }
    } catch (error) {
        res.json({ error: error }).status(500);
    }
}