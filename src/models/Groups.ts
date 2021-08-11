import mongoose, { Schema, model } from "mongoose";

export interface Groups extends mongoose.Document {
  name: String;
  concatName?: String;
  memberCode: String;
  visitorCode: String;
  members?: [
    {
      userRef: String;
      mobileToken: String;
    }
  ];
  enterpriseRef: String;
  visits?: [
    {
      userRef: String;
      visitDate: Date;
      mobileToken: String;
    }
  ];
}

// Schema definition for database
const groupsSchema: Schema = new Schema({
  name: { type: String },
  concatName: { type: String },
  memberCode: { type: String },
  visitorCode: { type: String },
  members: [
    {
      userRef: { type: Schema.Types.ObjectId, required: true },
      mobileToken: { type: String, required: true },
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
      mobileToken: { type: String, required: true },
    },
  ],
});

export default model<Groups>('Groups', groupsSchema);
