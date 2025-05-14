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
exports.AuthService = void 0;
const data_source_1 = require("../config/data-source");
const user_1 = require("../entities/user");
const jwt_1 = require("../utils/jwt");
const innovator_entity_1 = require("../entities/innovator.entity");
const investor_entity_1 = require("../entities/investor.entity");
const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
const investorRepo = data_source_1.AppDataSource.getRepository(investor_entity_1.Investor);
const innovatorRepo = data_source_1.AppDataSource.getRepository(innovator_entity_1.Innovator);
class AuthService {
    static register(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role, phoneNumber } = data;
            const existing = yield userRepo.findOne({ where: { email } });
            if (existing)
                throw new Error('Email already in use');
            const newUser = userRepo.create({
                name,
                email,
                password,
                role,
                phone_number: phoneNumber,
            });
            const savedUser = yield userRepo.save(newUser);
            if (role === 'investor') {
                const investor = investorRepo.create({
                    investor_id: savedUser.user_id,
                    company_name: '',
                    company_description: '',
                    profile_picture: null,
                    interest: [],
                    total_investment: 0,
                });
                yield investorRepo.save(investor);
                newUser.investor = investor;
                yield userRepo.save(newUser);
            }
            else if (role === 'innovator') {
                const newinnovator = innovatorRepo.create({
                    innovator_id: savedUser.user_id,
                    company_name: '',
                    company_description: '',
                    profile_picture: null,
                    industry: '',
                    funds_raised: 0,
                });
                const savedInnovator = yield innovatorRepo.save(newinnovator);
                newUser.innovator = savedInnovator;
                yield userRepo.save(newUser);
            }
            return (0, jwt_1.generateToken)({ id: newUser.user_id, role: newUser.role });
        });
    }
    static login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepo.findOne({ where: { email } });
            if (!user)
                throw new Error('Invalid credentials');
            // Compare plain password directly
            if (password !== user.password)
                throw new Error('Invalid credentials');
            let isFirstTime = false;
            if (user.role == "investor") {
                const investor = yield investorRepo.findOne({ where: { investor_id: user.user_id } });
                if (investor && (!investor.interest || investor.interest.length === 0)) {
                    isFirstTime = true;
                }
            }
            return {
                token: (0, jwt_1.generateToken)({ id: user.user_id, role: user.role }),
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isFirstTime,
                }
            };
        });
    }
}
exports.AuthService = AuthService;
