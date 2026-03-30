import Category from "../models/category.model.js";
import { errorResponseHandler, successResponseHandler } from "../../helpers/response.handler.js";
import mongoErrorHandler from "../../helpers/mongo.error.handler.js";
import geofeedModel from "../models/geofeed.model.js";

export default class CategoryController {

    static async createCategory(req, res) {
        try {
            const { name, description } = req.body;

            const existing = await Category.findOne({ name });
            if (existing) {
                return errorResponseHandler(res, "Category already exists", 400)
            }

            const category = new Category({ name, description });
            await category.save();

            return successResponseHandler(res, "Category created", 201, category);

        } catch (err) {
            console.error("Error creating category:", err);
            return mongoErrorHandler(err, res);
        }
    }

    // ✅ Get all
    static async getAllCategories(req, res) {
        try {
            const categories = await Category.find().sort({ createdAt: -1 });

            return successResponseHandler(res, "Fetched", 200, categories);

        } catch (err) {
            console.error("Error fetching categories:", err);
            return mongoErrorHandler(err, res);
        }
    }

    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const updated = await Category.findByIdAndUpdate(
                id,
                { name, description },
                { new: true }
            );

            if (!updated) {
                return errorResponseHandler(res, "Category not found", 404);
            }

            return successResponseHandler(res, "Updated", 200, updated);

        } catch (err) {
            console.error("Error updating category:", err);
            return mongoErrorHandler(err, res);
        }
    }

    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            const isUsed = await geofeedModel.findOne({
                categories: id,
            });

            if (isUsed) {
                return errorResponseHandler(res, "Category is already in used cannot be deleted!", 400);
            }

            await Category.findByIdAndDelete(id);

            return successResponseHandler(
                res,
                "Category deleted successfully",
                200
            );

        } catch (err) {
            console.error("Error deleting category:", err);
            return mongoErrorHandler(err, res);
        }
    }

}