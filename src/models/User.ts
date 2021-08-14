import mongoose, { Schema, model, Date } from "mongoose"
import bcrypt from 'bcrypt'

enum Gender {
    male = 'male',
    female = 'female',
    other = 'other'
};

export enum HealthCondition {
    healthy = 'healthy',
    risk = 'risk',
    infected = 'infected'
};

export interface User extends mongoose.Document{
    name: String;
    lastName: String;
    gender: Gender; 
    symptomsDate: Date; 
    infectedDate: Date;
    access: {
        email: String;
        password: String;
    };
    healthCondition?: HealthCondition;
    mobileTokens?: String[];
    comparePassword: (password: String) => Promise<boolean>;
};

//Schema definition for database
const userSchema: Schema<User> = new Schema({
    name:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: '{VALUE} no es soportado'
        },
        required: true
    },  
    healthCondition: {
        type: String,
        enum: {
            values: ['healthy', 'risk', 'infected'],
            message: '{VALUE} no es soportado',
            default: 'healthy'
        }
    },
    symptomsDate:{
        type:Date
    }, 
    infectedDate:{
        type:Date
    }, 
    access:{
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        }
    },
    mobileTokens: [{
        type: String,
        required: true,
        // unique: true,
        // sparse: true,
        default: ''
    }]
});

// This function allows to compare the requested pasword with the pasword stored in database
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, String(this.access.password));
}

// Hash password into a bycript digest
userSchema.pre<User>('save', async function(next) {
    const user = this; // document to save
    // if password is not being modified
    if (!user.isModified('access.password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.access.password.toString(), salt);
    user.access.password = hash;
});

export default model<User>('User', userSchema);