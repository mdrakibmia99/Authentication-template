import { Schema } from "mongoose";

export const AddressSchema = new Schema(
  {
    address: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
  },
  { _id: false }
);

// 2dsphere index for geospatial queries
AddressSchema.index({ location: "2dsphere" });