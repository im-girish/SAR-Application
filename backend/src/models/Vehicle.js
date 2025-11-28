import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["tank", "truck", "ship", "aircraft", "other"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["ground", "naval", "air"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    specifications: {
      weight: String,
      length: String,
      width: String,
      height: String,
      crew: Number,
      speed: String,
      range: String,
      armament: [String],
    },
    images: [
      {
        url: String,
        caption: String,
      },
    ],
    country: {
      type: String,
      required: true,
    },
    inService: {
      type: Boolean,
      default: true,
    },
    yearIntroduced: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Vehicle", vehicleSchema);
