import PlanModel from "../models/plan.request.model.js";
import mongoErrorHandler from "../../helpers/mongo.error.handler.js";
import { successResponseHandler } from "../../helpers/response.handler.js";
import GeoFeedData from "../models/geofeed.model.js";
import { Parser } from "json2csv";

export default class GeoFeedController {

    static async submitPlanRequest(req, res) {
        try {
            const { name, email, mobile, city, message } = req.body;

            const newPlanRequest = new PlanModel({
                name,
                email,
                mobile,
                city,
                message,
            });

            await newPlanRequest.save();

            return successResponseHandler(res, "Plan request submitted successfully", 201);
        } catch (err) {
            return mongoErrorHandler(err, res);
        }
    }

    static async submitGeoFeedData(req, res) {
        try {
            const {
                ip,
                countryCode,
                regionCode,
                city,
                postalCode,
                categories
            } = req.body;

            if (!ip || !countryCode) {
               return errorResponseHandler(res, "IP and Country Code are required", 400);
            }


            const newData = new GeoFeedData({
                ip,
                countryCode,
                regionCode,
                city,
                postalCode,
                categories: categories || []
            });

            await newData.save();

            return successResponseHandler(res, "Created", 201, newData);

        } catch (err) {
            console.log("Error creating GeoFeed data:", err);
            return mongoErrorHandler(err, res);
        }
    }

    static async updateGeoFeedData(req, res) {
        try {
            const { id } = req.params;
            const {
                ip,
                countryCode,
                regionCode,
                city,
                postalCode,
                categories
            } = req.body;

            const updated = await GeoFeedData.findByIdAndUpdate(
                id,
                {
                    ip,
                    countryCode,
                    regionCode,
                    city,
                    postalCode,
                    categories: categories || []
                },
                { new: true }
            ).populate("categories", "name description");

            if (!updated) {
               return errorResponseHandler(res, "GeoFeed not found", 404);
            }

            return successResponseHandler(res, "Updated", 200, updated);

        } catch (err) {
            return mongoErrorHandler(err, res);
        }
    }

    static async fetchAllGeoFeedData(req, res) {
        try {
            let { search = "", categoryId, page = 1, limit = 10 } = req.query;

            page = parseInt(page);
            limit = parseInt(limit);

            let query = {};

            if (search) {
                query.$or = [
                    { ip: { $regex: search, $options: "i" } },
                    { countryCode: { $regex: search, $options: "i" } },
                    { regionCode: { $regex: search, $options: "i" } },
                    { city: { $regex: search, $options: "i" } },
                    { postalCode: { $regex: search, $options: "i" } },
                ];
            }

            if (categoryId) {
                query.categories = { $in: [categoryId] };
            }

            const total = await GeoFeedData.countDocuments(query);

            const data = await GeoFeedData.find(query)
                .populate("categories", "name description")
                .sort({ updatedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            return successResponseHandler(res, "Fetched", 200, {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });

        } catch (err) {
            console.error("Error fetching GeoFeed data:", err);
            return mongoErrorHandler(err, res);
        }
    }

    static async deleteGeoFeed(req, res) {
        try {
            const { id } = req.params;

            await GeoFeedData.findByIdAndDelete(id);

            return successResponseHandler(res, "Deleted", 200);

        } catch (err) {
            return mongoErrorHandler(err, res);
        }
    }

    static async downloadGeoFeedCSV(req, res) {
        try {
            const records = await GeoFeedData.find()
                .populate("categories", "name")
                .lean();

            const data = records.map(r => ({
                ip: r.ip,
                country_code: r.countryCode,
                region_code: r.regionCode,
                city: r.city,
                postal: r.postalCode,
                categories: r.categories.map(c => c.name).join(", ")
            }));

            const parser = new Parser();
            const csv = parser.parse(data);

            res.header("Content-Type", "text/csv");
            res.attachment("geofeed.csv");

            return res.send(csv);

        } catch (err) {
            console.error("Error downloading GeoFeed CSV:", err);
            return mongoErrorHandler(err, res);
        }
    }
}