import { Schema, model, Document } from "mongoose"

export interface Symptoms extends Document {
    symptoms: String[];
    symptomsDate: Date;
    remarks?: String;
    isCovid?: Boolean;
    covidDate?: Date;
    userRef: Schema.Types.ObjectId;
};

// Schema definition for database
const symptomsSchema: Schema<Symptoms> = new Schema({
    symptoms: { type: [String], required: true },
    symptomsDate: { type: Date, required: true },
    remarks: { type: String },
    isCovid: { type: Boolean },
    covidDate: { type: Date },
    userRef: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

export default model<Symptoms>('Symptoms', symptomsSchema);