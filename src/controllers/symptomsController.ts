// Imported packages
import { Request, Response } from 'express';

// Imported files
import UserModel, { HealthCondition, User } from '../models/User';
import SymptomsModel, { Symptoms } from '../models/Symptoms';

// Save a new symptom in the collection
export const saveSymptoms = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.healthCondition) return res.status(400).json({msg: 'Hace falta healthCondition'});
    const { symptoms, symptomsDate, remarks, isCovid, covidDate } = req.body;

    console.log(req.body)

    const userReq = req.user as User;
    const userRef = userReq.id;
    const healthCondition = req.body.healthCondition as HealthCondition;

    try {
        var hasError: boolean = false;
        const symptomsReg: Symptoms = await SymptomsModel.findByIdAndUpdate( userRef,
            { userRef, symptoms, symptomsDate, remarks, isCovid, covidDate },
            { upsert: true, new: true, setDefaultsOnInsert: true },
            function(error, result) { if (error) hasError = true; });
        
        var isUpdated: boolean = true; // Handle if document is updated
        await UserModel.findByIdAndUpdate(
            userReq.id, 
            { $set: { healthCondition } },
            { new: true, upsert: true },
            function (err, doc) { if (err) hasError = true; });

        if (hasError) return res.status(400).json({ msg: 'Hubo un problema con la base de datos.' });
        // new SymptomsModel({ userRef, symptoms, symptomsDate, remarks, isCovid, covidDate });
        // await symptomsReg.save();
        return res.json({ symptomsReg, msg: 'Symptoms saved on database' });
    } catch (error) {
        return res.json({ error: error }).status(500);
    }
}

// Delete symptoms from the collection
export const deleteSymptoms = async (req: Request, res: Response): Promise<Response> => {
    console.log(req.body)

    const userReq = req.user as User;
    const userRef = userReq.id;
    
    try {
        var hasError:boolean = false;
        await SymptomsModel.findOneAndRemove(userRef);
        await UserModel.findByIdAndUpdate(
            userRef, 
            { $set: { healthCondition: HealthCondition.healthy } },
            { new: true, upsert: true },
            function (err, doc) { if (err) {
                console.log(err)
                hasError = true;
            } });

        if (hasError) return res.status(400).json({ msg: 'Hubo un problema con la base de datos.' });

        return res.json({  msg: 'Symptoms deleted from database' });
    } catch (error) {
        console.log(error);
        return res.json({ error: error }).status(500);
    }
}