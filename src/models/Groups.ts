import mongoose, { Schema, model } from "mongoose";

export interface Groups extends mongoose.Document {
  name: String;
  code: String;
  members: [
    {
      userRef: String;
    }
  ];
  enterpriseRef: String;
  visits: [
    {
      userRef: String;
      visitDate: Date;
    }
  ];
}

// Schema definition for database
const groupsSchema: Schema = new Schema({
  name: { type: String },
  code: { type: String },
  members: [
    {
      userRef: { type: Schema.Types.ObjectId, required: true },
    },
  ],
  enterpriseRef: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Enterprise",
  },
  visits: [
    {
      userRef: { type: Schema.Types.ObjectId, required: true },
      visitDate: { type: Date, required: true },
    },
  ],
});

export default model<Groups>('Groups', groupsSchema);
