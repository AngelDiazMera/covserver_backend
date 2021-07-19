import mongoose, { Schema, model } from "mongoose";

export interface User extends mongoose.Document{
    name: String
    lastName: String,
    isFamale: Boolean,
    access: {
        email: String,
        password: String
    },
};
//Schema definition for database
const userSchema: Schema = new Schema({
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
export default model<User>('User', userSchema);