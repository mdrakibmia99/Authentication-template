import { Types } from "mongoose";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface UploadedFiles {
  image?: Express.Multer.File[];
  banner?: Express.Multer.File[];
  images?: Express.Multer.File[];
  frontSide?: Express.Multer.File[];
  backSide?: Express.Multer.File[];
  videos?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

export interface IGeoLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IAddress {
  address: string;
  location: IGeoLocation;
}

export interface IVehicleLocation {
  hostId: Types.ObjectId;
  isOfferDeliveryAddressActive?: boolean;
  deliveryOrHomeAddress?: IAddress;
}