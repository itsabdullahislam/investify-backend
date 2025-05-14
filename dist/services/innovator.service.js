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
exports.updateInnovatorProfileService = exports.getInnovatorProfile = void 0;
const data_source_1 = require("../config/data-source");
const innovator_entity_1 = require("../entities/innovator.entity");
const user_1 = require("../entities/user");
const getInnovatorProfile = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    const user = yield userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.innovator', 'innovator')
        .where('user.user_id = :user_id', { user_id })
        .getOne();
    if (!user || !user.innovator) {
        throw new Error('Innovator profile not found');
    }
    return { user };
});
exports.getInnovatorProfile = getInnovatorProfile;
const updateInnovatorProfileService = (user_id, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    const innovatorRepo = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
    const user = yield userRepo.findOne({
        where: { user_id },
        relations: ['innovator'],
    });
    if (!user || user.role !== 'innovator') {
        throw new Error('User not found or is not an innovator.');
    }
    // Update user table fields
    if (updates.name)
        user.name = updates.name;
    if (updates.phone_number)
        user.phone_number = updates.phone_number;
    yield userRepo.save(user);
    // Update innovator table fields
    const innovator = user.innovator;
    if (innovator) {
        if (updates.company_name)
            innovator.company_name = updates.company_name;
        if (updates.company_description)
            innovator.company_description = updates.company_description;
        yield innovatorRepo.save(innovator);
    }
    return { user };
});
exports.updateInnovatorProfileService = updateInnovatorProfileService;
