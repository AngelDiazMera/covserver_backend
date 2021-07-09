import mongoose, { Schema, model } from "mongoose";

export interface User extends mongoose.Document{
    name: String
    lastName: String,
    gender: String,
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
    gender:{
        type: String,
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