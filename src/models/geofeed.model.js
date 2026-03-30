import mongoose from "mongoose";

const geofeedSchema = new mongoose.Schema(
    {
        countryCode: {
            type: String,
            required: [true, "Country code is required"],
            trim: true,
            minlength: 1,
        },
        regionCode: String,
        city: String,
        postalCode: String,
        ip: { type: String, required: true, unique: true, index: true },
        name: { type: String, trim: true },
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
    },
    { timestamps: true }
);

export default mongoose.model("GeoFeed", geofeedSchema);