import z from "zod";

export const locationWithAddressSchema = z.object({
    address: z.string().min(1, 'Address is required'),
    location: z.object({
        type: z.literal('Point'),
        coordinates: z
            .tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    }),
})

// Location schema
export const locationSchema = z.object({
    type: z.literal("Point", { message: "Location type must be 'Point'" }),
    coordinates: z
        .tuple([
            z.number().min(-180).max(180, { message: "Invalid longitude value" }),
            z.number().min(-90).max(90, { message: "Invalid latitude value" }),
        ])
});

// Host data schema
const hostDataSchema = z.object({
    description: z
        .string({ message: "Description is required" })
        .min(10, { message: "Description must be at least 10 characters" }),
    shareYourCar: z.string({ message: "Share your car field is required" }),
    phone: z
        .string({ message: "Phone number is required" })
        .regex(/^\+?[0-9]{10,15}$/, { message: "Invalid phone number format" }),
    // carLocation: z.object({
    //     address: z.string({ message: "Address is required" }),
    //     location: locationSchema,
    // }),
});

// Vehicle data schema
export const vehicleDataSchema = z.object({
    vinNumber: z.string({ message: "VIN number is required" }),
    isCarModel1981: z.boolean({ message: "isCarModel1981 must be boolean" }),
    vehicleType: z.string({ message: "Vehicle type is required" }),
    vehicleName: z.string({ message: "Vehicle name is required" }),
    vehicleModel: z.string({ message: "Vehicle model is required" }),
    trimLevel: z.string().optional(),
    seatingCapacity: z.number({ message: "Seating capacity is required" }),
    transmission: z.string({ message: "Transmission type is required" }),
    fuelType: z.string({ message: "Fuel type is required" }),
    milagePerGallon: z.number({ message: "Mileage per gallon is required" }),
    fuelEfficiency: z.number({ message: "Fuel efficiency is required" }),
    driveType: z.string({ message: "Drive type is required" }),
    bodyType: z.string({ message: "Body type is required" }),
    color: z.string({ message: "Color is required" }),
    comfortConvenience: z.array(z.string()).optional(),
    deviceConnectivity: z.array(z.string()).optional(),
    safetyFeature: z.array(z.string()).optional(),
    extras: z.array(z.string()).optional(),
    perDayPrice: z.number().min(1, { message: "Price must be positive" }),
    cleanFee: z.number().min(1, { message: "Price must be positive" }).optional(),
    licenseCountry: z.string({ message: "License country is required" }),
    licenseFirstName: z.string({ message: "License first name is required" }),
    licenseLastName: z.string().optional(),
    licenseNumber: z.string({ message: "License number is required" }),
    licenseDOB: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid DOB format" }),
    licenseExpiryDate: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid expiry date format" }),
});


// const createVehicleSchema = z.object({
//     body: z.object({
//         location: locationSchema,
//         vehicleData: vehicleDataSchema,
//     }),
// });
const interfaceHostAndVehicleSchema = z.object({
    hostData: hostDataSchema,
    vehicleData: vehicleDataSchema,
    location: locationWithAddressSchema

});




// ✅ Type inference (optional)
export type TCreateHostAndVehicle = z.infer<typeof interfaceHostAndVehicleSchema>;

