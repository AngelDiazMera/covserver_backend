import mongoose, { Schema, model, Date } from "mongoose"
import bcrypt from 'bcrypt'

enum Gender {
    male = 'male',
    female = 'female',
    other = 'other'
};

enum HealthCondition {
    healthy = 'healthy',
    risk = 'risk',
    infected = 'infected'
};

export interface User extends mongoose.Document{
    name: String;
    lastName: String;
    gender: Gender; 
    healthCondition: HealthCondition;
    symptomsDate: Date; 
    infectedDate: Date;
    access: {
        email: String;
        password: String;
    };
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
    healthCondition:{
        type: String,
        enum: {
            values: ['Riesgo bajo', 'Riesgo medio', 'Contagiado'],
            message: '{VALUE} no es soportado'
        },
        required: true
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
        unique: true
    }]
});

// This function allows to compare the requested pasword with the pasword stored in database
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, String(this.access.password));
}

export default model<User>('User', userSchema);