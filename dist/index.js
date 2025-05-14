"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./config/data-source");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const campaign_routes_1 = __importDefault(require("./routes/campaign.routes"));
const cors_1 = __importDefault(require("cors"));
const investor_routes_1 = __importDefault(require("./routes/investor.routes"));
const path_1 = __importDefault(require("path"));
const innovator_routes_1 = __importDefault(require("./routes/innovator.routes"));
const like_routes_1 = __importDefault(require("./routes/like.routes"));
const investment_routes_1 = __importDefault(require("./routes/investment.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./middleware/auth");
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const socket_1 = require("./socket/socket");
const search_routes_1 = __importDefault(require("./routes/search.routes"));
dotenv_1.default.config();
// Define the PORT variable
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Data Source has been initialized!');
    // Middleware to parse JSON bodies
    app.use(express_1.default.json());
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    (0, socket_1.initSocket)(server);
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3001', // frontend URL
        credentials: true,
    }));
    app.use((0, cookie_parser_1.default)());
    app.get('/api/me', auth_1.authenticateUser, (req, res) => {
        if (req.user) {
            res.status(200).json(req.user); // Ensure req.user is properly cast
        }
        else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    });
    app.use((0, cookie_parser_1.default)());
    // Register routes
    app.use('/api', search_routes_1.default);
    app.use("/api/chat", chat_routes_1.default);
    app.use('/api/investment', investment_routes_1.default);
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
    app.use('/api', innovator_routes_1.default);
    app.use('/api', investor_routes_1.default);
    app.use('/api/auth', auth_routes_1.default);
    app.use('/api/campaigns', campaign_routes_1.default);
    app.use('/api', like_routes_1.default);
    // Start the server
    app.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
})
    .catch((err) => {
    console.error('Error during Data Source initialization', err);
});
