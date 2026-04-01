import express from "express";
const router = express.Router();

import WebsiteDataController from "../controllers/website.data.controller.js";
import { IdValidator } from "../../helpers/general.request.helper.js";
import { handleValidationErrors } from "../../helpers/response.handler.js";

router.post("/plan-request", WebsiteDataController.submitPlanRequest);
router.post("/geofeed-data", WebsiteDataController.submitGeoFeedData);
router.get("/geofeed-data", WebsiteDataController.fetchAllGeoFeedData);
router.get("/geofeed.csv", WebsiteDataController.downloadGeoFeedCSV);
router.put("/geofeed-data/:id", IdValidator, handleValidationErrors, WebsiteDataController.updateGeoFeedData);
router.post("/delete-geofeed/:id",IdValidator, handleValidationErrors, WebsiteDataController.deleteGeoFeed);
router.get("/header-config", WebsiteDataController.getHeaderConfig);

export default router;