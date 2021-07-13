import mongoose, { Schema, model } from "mongoose";

export interface Enterprise extends mongoose.Document {
    name: String,
    acronym: String,
    access: {
        email: String,
        password: String
    },
};

// Schema definition for database
const enterpriseSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    acronym: {
        type: String,
        required: true
    },
    access: {
        email: {
            type: String,
            required: true,
            unique:true 
        },
        password: {
            type: String,
            required: true
        }
    }
});

export default model<Enterprise>('Enterprise', enterpriseSchema);