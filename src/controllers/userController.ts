//import packages
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'
//Import files
import UserModel,{User} from '../models/User';
import config from '../config/config';
import EnterpriseModel, { Enterprise } from '../models/Enterprise'
import GroupsModel, { Groups } from '../models/Groups';
//Dependencies of mongoose
import mongoose, { Number } from 'mongoose'
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
    if (!req.body.name || !req.body.lastName || !req.body.gender || !req.body.healthCondition|| !req.body.access.password || !req.body.access.email || !req.body.mobileToken) 
        return res.status(400).json({msg: 'Por favor envía tóken móvil, nombre, apellidos, género, correo y contraseña'});
    
    // Validate if a register with an specified email already exists
    const user = await UserModel.findOne({'access.email': req.body.access.email});
    if (user)
        return res.status(400).json({msg: 'El usuario con ese email ya ha sido registrado'});
    // Save the new user to database
    const { name, lastName,gender, symptomsDate, infectedDate, healthCondition, access, mobileToken } = req.body;
    try {
        const mobileTokens: string[] = [mobileToken];
        const newUser: User = new UserModel({ name, lastName, gender, symptomsDate, infectedDate, healthCondition, access, mobileTokens});
        await newUser.save();
        return res.status(200).json({
            newUser, 
            msg: 'El usuario ha sido almacenada con éxito', 
            token: _createToken(newUser), 
        });
    } catch (error) {
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
        const members: any[] = await GroupsModel.aggregate([
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
                "members": {
                  "$push": "$members"
                }
              }
            },
            {
              "$project": {
                "_id": 1,
                "members.userRef": 1,
                "members.name": 1,
                "members.lastName": 1,
                "members.gender": 1,
                "members.healthCondition": 1,
                "members.symptomsDate": 1,
                "members.infectedDate": 1
              }
            }
          ]
        );
        if (members.length === 0) return res.json({msg: 'Error al obtener los datos.'}).status(400);
        res.json({ members });     
    } catch (error) {
        res.json({ error: error , msg: `Error lenght`}).status(500);
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
        const visits: any = await GroupsModel.aggregate([
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
              "visits": {
                "$push": "$visits"
              }
            }
          },
          {
            "$project": {
              "_id": 1,
              "visits.visitDate": 1,
              "visits.name": 1,
              "visits.lastName": 1,
              "visits.symptomsDate": 1,
              "visits.infectedDate": 1,
              "visits.gender": 1,
              "visits.healthCondition": 1
            }
          }
        ]
        );
        if (visits.length === 0) return res.json({msg: 'Error al obtener los datos.'}).status(400); 
        res.json({ visits });
  } catch (error) {
    console.error(error);
      res.json({ error: error , msg: `Error de API`}).status(500);
  }
};