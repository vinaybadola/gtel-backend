import { body , param} from "express-validator";

export const IdValidator = [
    param("id")
    .notEmpty().withMessage("ID is required")
    .isMongoId().withMessage("Invalid ID format")
];
