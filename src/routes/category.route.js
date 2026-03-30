import express from "express";
import CategoryController from "../controllers/category.controller.js";
import { IdValidator } from "../../helpers/general.request.helper.js";
import { handleValidationErrors } from "../../helpers/response.handler.js";

const router = express.Router();

router.post("/", CategoryController.createCategory);
router.get("/all", CategoryController.getAllCategories);
router.delete("/remove/:id", IdValidator, handleValidationErrors, CategoryController.deleteCategory);

export default router;