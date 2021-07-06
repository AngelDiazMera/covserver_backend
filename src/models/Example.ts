import mongoose, { Schema, model } from "mongoose";

// This way you can validate the Example from outside. Actually, you can verify if an Example is completely an Example
export interface Example extends mongoose.Document {
    title: String,
    description?: String,
};
// Schema definition for database
const exampleSchema:Schema = new Schema({
    title: {type: String, required: true},
    description: String,
});

export default model<Example>('Example', exampleSchema);