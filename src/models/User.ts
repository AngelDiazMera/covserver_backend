import mongoose, { Schema, model } from "mongoose"
import bcrypt from 'bcrypt'

export interface User extends mongoose.Document{
    name: String;
    lastName: String;
    isFamale: Boolean;
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
    isFamale:{
        type: Boolean,
        required: true
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
    }
});

// This function allows to compare the requested pasword with the pasword stored in database
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, String(this.access.password));
}

export default model<User>('User', userSchema);