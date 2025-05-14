"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const user_1 = require("../entities/user");
const campaign_entity_1 = require("../entities/campaign.entity");
const innovator_entity_1 = require("../entities/innovator.entity");
const investment_1 = require("../entities/investment");
const investor_entity_1 = require("../entities/investor.entity");
const like_entity_1 = require("../entities/like.entity"); // Adjust path if necessary
const message_entity_1 = require("../entities/message.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    //host: process.env.DB_HOST || 'localhost',
    //port: parseInt(process.env.DB_PORT!) || 5432,
    //username: process.env.DB_USER || 'postgres',
    //password: process.env.DB_PASS || 'fast4896',
    //database: process.env.DB_NAME || 'investify',
    synchronize: true,
    url: process.env.URL || "postgresql://neondb_owner:npg_FDAvZK9MuIf3@ep-bitter-bread-a47br395-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require",
    logging: true,
    entities: [user_1.User, campaign_entity_1.Campaign, investor_entity_1.Investor, innovator_entity_1.Innovator, investment_1.Investment, like_entity_1.Like, message_entity_1.Message],
    migrations: [],
    subscribers: [],
});
