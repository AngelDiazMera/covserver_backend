import { Model, Document } from 'mongoose';

import EnterpriseModel, { Enterprise } from "../models/Enterprise";
import UserModel, { User } from "../models/User";
// Add extra interfaces if needed

type EnterpriseType = Enterprise & Document;
type UserType = User & Document;
// Add extra types if needed

interface AuthOpts {
    [key: string]: 
        Model<EnterpriseType> | 
        Model<UserType>; 
        // Add extra props if needed
};

// HERE IT GOES THE ROLES ...
const authorization: AuthOpts = {
    'enterprise': EnterpriseModel, 
    'mobile': UserModel 
};
export default authorization;