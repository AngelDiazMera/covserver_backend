import { Schema, model, Document } from "mongoose"

enum Risk {
    none = 'none',
    risk = 'risk',
    infected = 'infected'
};
export interface Symptoms extends Document {
    symptoms: String[];
    symptomsDate: Date;
    remarks?: String;
    isCovid?: Boolean;
    covidDate?: Date;
    userRef: Schema.Types.ObjectId;
    risk: Risk
};

// Schema definition for database
const symptomsSchema: Schema<Symptoms> = new Schema({
    symptoms: { type: [String] },
    symptomsDate: { type: Date },
    remarks: { type: String },
    isCovid: { type: Boolean, default: false },
    covidDate: { type: Date },
    userRef: { type: Schema.Types.ObjectId, ref: "User", required: true },
    risk: {
        type: String,
        enum: {
            values: ['none', 'risk', 'infected'],
            message: '{VALUE} no es soportado',
            default: 'none'
        }
    },
    // 31 days and one minute to expire
    createdAt: { type: Date, expires: 31 * 24 * 60 * 60, default: Date.now }
});

export default model<Symptoms>('Symptoms', symptomsSchema);