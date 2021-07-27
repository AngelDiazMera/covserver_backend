// Imported packages
import { Request, Response } from 'express';

// Imported files
import UserModel, { User } from '../models/User';
import SymptomsModel, { Symptoms } from '../models/Symptoms';

// Save a new symptom in the collection
export const saveSymptoms = async (req: Request, res: Response): Promise<void> => {
    const { symptoms, symptomsDate, remarks, isCovid, covidDate } = req.body;
    const userReq = req.user as User;
    const userRef = userReq.id;
    try {
        const user: User | null = await UserModel.findById(userRef);
        if(user == null){
            res.json({msg: 'User ref is not correct'});
            return;
        }
        const symptomsReg: Symptoms = new SymptomsModel({ userRef, symptoms, symptomsDate, remarks, isCovid, covidDate });
        await symptomsReg.save();
        res.json({ symptomsReg, msg: 'Symptoms saved on database' });
    } catch (error) {
        res.json({ error: error }).status(500);
    }
}