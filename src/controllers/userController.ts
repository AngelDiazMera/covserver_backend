//import packages
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'

//Import files
import UserModel,{ HealthCondition, User } from '../models/User';
import config from '../config/config';
import { addMinutes } from '../lib/dateModifiers';
import EnterpriseModel, { Enterprise } from '../models/Enterprise'
import GroupsModel, { Groups } from '../models/Groups';
//Dependencies of mongoose
import mongoose, { Number } from 'mongoose'
import { hashBcrypt } from '../lib/hash';
const {ObjectId} = mongoose.Types;

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
    if (!req.body.name || !req.body.lastName || !req.body.gender|| !req.body.access.password || !req.body.access.email || !req.body.mobileToken) 
        return res.status(400).json({msg: 'Por favor envía tóken móvil, nombre, apellidos, género, correo y contraseña'});
    
    // Validate if a register with an specified email already exists
    const user = await UserModel.findOne({'access.email': req.body.access.email});
    if (user)
        return res.status(400).json({msg: 'El usuario con ese email ya ha sido registrado'});
    // Save the new user to database
    const { name, lastName, gender, access, mobileToken} = req.body;
    try {
        const mobileTokens: string[] = [mobileToken];
        const newUser: User = new UserModel({...{ name, lastName, gender, access, mobileTokens}, ... { healthCondition: 'healthy'}});
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
                gender: user.gender,
                healthCondition: user.healthCondition,
                infectedDate: user.infectedDate,
                symptomsDate: user.symptomsDate
            }});
    
    return res.status(400).json({msg: 'La contraseña es incorrecta'});
};

// Updates user data
export const updateMyUser = async (req: Request, res: Response): Promise<Response> => {
  if (!req.body) 
      return res.status(400).json({msg: 'Debe especificar al menos un atributo a modificar'});
  
  const entReq = req.user as User;
  const userObj = req.body;

  if (userObj.hasOwnProperty('access.password')) 
    userObj['access.password'] = await hashBcrypt(userObj['access.password'], 10);

  try{
    const user: User | null = await UserModel.findByIdAndUpdate(entReq.id,userObj);
    if (!user) 
      return res.status(404).json({
        msg: 'No se puede actualizar el usuario'
      });
    return res.json({ msg: "Datos actualizados exitosamente!" });
  } catch (error){
    return res.status(500).json({ error: error , msg: 'Hubo un problema con el registro'});
  }
}

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
            gender: user.gender,
            healthCondition: user.healthCondition
        });
    } catch (error) {
        return res.json({ error: error, msg: 'Hubo un problema con el registro' }).status(400);
    }
};

// Get the symptoms registered by the user
export const getSymptoms = async (req: Request, res: Response): Promise<Response | any> => {
    if (!req.user) return res.status(400).json({msg: 'La referencia del usuario es incorrecta'});
    const userReq = req.user as User; // user from passport
    try {
        // TODO: Check json response structure according to the frontend requirements
        const symptoms: any[] = await UserModel.aggregate([
            { $match: {"_id": ObjectId(userReq.id)} },
            {
                $lookup:
                {
                    from: "symptoms",
                    localField: "_id",
                    foreignField: "userRef",
                    as: "fromSymptoms"
                }
           }, 
           { $project: { 
                    "_id": 0, 
                    "fromSymptoms.symptoms": 1, 
                    "fromSymptoms.symptomsDate": 1, 
                    "fromSymptoms.remarks": 1 ,
                    "fromSymptoms.isCovid": 1,
                    "fromSymptoms.covidDate": 1
                } 
            }
         ]
        );
        if (symptoms.length === 0) return res.status(400).json({msg: 'El usuario no tiene síntomas'})
        return res.json({ fromSymptoms: symptoms[0].fromSymptoms });
    } catch (error) {
        return res.json({ error: error }).status(500);
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
  
    const userReq = req.user as User; // user from passport
    const healthCondition = req.body.healthCondition as HealthCondition;
  
    try {
        var isUpdated: boolean = true; // Handle if document is updated
        await UserModel.findByIdAndUpdate(
            userReq.id, 
            { $set: { healthCondition } },
            { new: true, upsert: true },
            function (err, doc) { if (err) isUpdated = false; });
        // If updated, return status 200 and message
        if (isUpdated)
            return res.json({msg: 'La condición de salud del usuario ha sido actualizada'});
      
        return res.status(400).json({ msg: 'Hubo un problema con la actualización' });
    } catch (error) {
        return res.json({ error: error }).status(500);
    }
}
  
//This get the codes only of members
export const getMembers = async (req: Request, res: Response): Promise<Response|any > => {
    if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

    const entReq = req.user as Enterprise; // user from passport 
    
    //Limit and nuber of elements that are ommited for skipt data, this is a request of the url 
    const vSkip:any = req.query.skip; 
    let skip: any = { };

    //This is a validation, when the user set 0, the query is not set in the aggregate query
    if(vSkip !== 0){
      skip =  { 
        $skip: parseInt(vSkip)
      };  
    } 

    try {
        const enterprise: Enterprise | null = await EnterpriseModel.findById(entReq.id);
        if (!enterprise) return res.status(404).json({msg: 'No se pudo encontrar la empresa'}); 
        const groups: any[] = await GroupsModel.aggregate([
            { 
                $match: {
                    "enterpriseRef": ObjectId(enterprise.id)
                } 
            },
            {
              "$unwind": "$members"
            },
            {
              "$lookup": {
                "from": "users",
                "localField": "members.userRef",
                "foreignField": "_id",
                "as": "membersJoined"
              }
            },
            {
              "$unwind": "$membersJoined"
            },
            {
              "$addFields": {
                "members": {
                  "$mergeObjects": [
                    "$members",
                    "$membersJoined"
                  ]
                }
              }
            }, 
            skip
            ,{
              $limit: 10
            },
            {
              "$group": {
                "_id": '$memberCode',
                "users": {
                  "$push": "$members"
                }
              }
            },
            {
              "$project": {
                "_id": 1,
                "users.userRef": 1,
                "users.name": 1,
                "users.lastName": 1,
                "users.gender": 1,
                "users.healthCondition": 1,
                "users.symptomsDate": 1,
                "users.infectedDate": 1
              }
            }
          ]
        );
        if (groups.length === 0) return res.status(200).json({groups: [], msg: 'Aún no hay registros'});

        const total = groups.reduce((acc:number, curr:any) => acc + curr.users.length, 0);
        return res.json({ groups, total });
    } catch (error) {
        return res.status(500).json({ error: error , msg: 'Hubo un error inesperado'});
    }
};

//This get the codes only of visits 
export const getVisits = async (req: Request, res: Response): Promise<Response|any > => {
  if (!req.user) return res.status(400).json({msg: 'La referencia de la empresa es incorrecta'});

  const entReq = req.user as Enterprise; // user from passport
  
  //Limit and nuber of elements that are ommited for skipt data, this is a request of the url 
  const vSkip:any = req.query.skip;  
  let skip: any = { };

  //This is a validation, when the user set 0, the query is not set in the aggregate query
  if(vSkip !== 0){
    skip =  { 
      $skip: parseInt(vSkip)
    };  
  } 

  try { 
    const enterprise: Enterprise | null = await EnterpriseModel.findById(entReq.id);
        if (!enterprise) return res.status(404).json({msg: 'No se pudo encontrar la empresa'}); 
        const groups: any = await GroupsModel.aggregate([
          { 
              $match: {
                  "enterpriseRef": ObjectId(enterprise.id)
              } 
          }, 
          {
            "$unwind": "$visits"
          },
          {
            "$lookup": {
              "from": "users",
              "localField": "visits.userRef",
              "foreignField": "_id",
              "as": "visitsJoined"
            }
          },
          {
            "$unwind": "$visitsJoined"
          },
          {
            "$addFields": {
              "visits": {
                "$mergeObjects": [
                  "$visits",
                  "$visitsJoined"
                ]
              }
            }
          }, 
          skip
          ,{
            $limit: 10
          },
          {
            "$group": {
              "_id": '$visitorCode',
              "users": {
                "$push": "$visits"
              }
            }
          },
          {
            "$project": {
              "_id": 1,
              "users.visitDate": 1,
              "users.name": 1,
              "users.lastName": 1,
              "users.symptomsDate": 1,
              "users.infectedDate": 1,
              "users.gender": 1,
              "users.healthCondition": 1,
              "users.userRef": 1
            }
          }
        ]
        );
        if (groups.length === 0) return res.status(200).json({groups: [],msg: 'Aún no hay registros'}); 
        const total = groups.reduce((acc:number, curr:any) => acc + curr.users.length,0);
        return res.json({ groups, total });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error , msg: 'Hubo un error inesperado'});
  }
};
