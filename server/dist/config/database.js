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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../config/logger"));
// Load environment variables from .env file
dotenv_1.default.config();
const isProduction = process.env.NODE_ENV === 'production';
logger_1.default.info(`Environment: ${process.env.NODE_ENV}`);
const supabaseUrl = 'https://bdbvtpsbgrxgieyvnvig.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) {
    throw new Error('SUPABASE_KEY is not defined in environment variables');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Test the connection
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { count } = yield supabase.from('books').select('*', { count: 'exact', head: true });
            logger_1.default.info('Connected to Supabase database');
            logger_1.default.info(`Found ${count} books in the database`);
        }
        catch (error) {
            if (error instanceof Error) {
                logger_1.default.error('An error occurred while connecting to Supabase:', error.message);
            }
            else {
                logger_1.default.error('An unknown error occurred while connecting to Supabase');
            }
        }
    });
}
// Run the test
testConnection();
exports.default = supabase;
