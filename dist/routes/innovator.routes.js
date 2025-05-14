"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const innovator_controller_1 = require("../controllers/innovator.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const innovator_controller_2 = require("../controllers/innovator.controller");
const router = express_1.default.Router();
router.get('/innovator/:user_id/profile', innovator_controller_1.getInnovatorProfileController);
router.put('/innovator/:user_id/profile/update', innovator_controller_1.updateInnovatorProfileController);
router.put('/innovator/:user_id/profile-picture', upload_middleware_1.upload.single('profile_picture'), innovator_controller_2.updateProfilePictureController);
exports.default = router;
