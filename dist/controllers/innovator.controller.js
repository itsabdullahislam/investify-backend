"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfilePictureController = exports.updateInnovatorProfileController = exports.getInnovatorProfileController = void 0;
const innovator_service_1 = require("../services/innovator.service");
const innovator_service_2 = require("../services/innovator.service");
const data_source_1 = require("../config/data-source");
const innovator_entity_1 = require("../entities/innovator.entity");
const getInnovatorProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    try {
        const innovator = yield (0, innovator_service_1.getInnovatorProfile)(user_id);
        res.status(200).json(innovator);
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch innovator profile",
            error: error.message,
        });
    }
});
exports.getInnovatorProfileController = getInnovatorProfileController;
const updateInnovatorProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const { name, phone_number, company_name, company_description } = req.body;
    try {
        const updatedProfile = yield (0, innovator_service_2.updateInnovatorProfileService)(user_id, {
            name,
            phone_number,
            company_name,
            company_description,
        });
        res.status(200).json({
            message: 'Profile updated successfully',
            profile: updatedProfile,
        });
    }
    catch (error) {
        console.error('Error updating innovator profile:', error);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message,
        });
    }
});
exports.updateInnovatorProfileController = updateInnovatorProfileController;
const updateProfilePictureController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_id = parseInt(req.params.user_id);
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }
    try {
        const innovatorRepo = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
        const innovator = yield innovatorRepo.findOne({
            where: { user: { user_id } },
            relations: ['user'],
        });
        if (!innovator) {
            res.status(404).json({ message: 'Innovator not found' });
            return;
        }
        innovator.profile_picture = file.path; // e.g., "uploads/12345-profile.png"
        yield innovatorRepo.save(innovator);
        res.status(200).json({
            message: 'Profile picture updated successfully',
        });
    }
    catch (error) {
        console.error('Error updating profile picture:', error);
        next(error);
    }
});
exports.updateProfilePictureController = updateProfilePictureController;
function next(error) {
    throw new Error('Function not implemented.');
}
