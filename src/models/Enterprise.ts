import { Schema, model, Document } from "mongoose"
import bcrypt from 'bcrypt'

export interface Enterprise extends Document {
    name: String;
    acronym: String;
    access: {
        email: String;
        password: String;
    };
    comparePassword: (password: String) => Promise<boolean>;
};

// Schema definition for database
const enterpriseSchema: Schema<Enterprise> = new Schema({
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
            unique:true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        }
    }
});

// This function allows to compare the requested pasword with the pasword stored in database
enterpriseSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, String(this.access.password));
}

export default model<Enterprise>('Enterprise', enterpriseSchema);