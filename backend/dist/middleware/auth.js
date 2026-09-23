"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Missing authorization token",
            });
        }
        const token = authHeader.substring(7);
        // Verify the JWT and get the authenticated user
        const authClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        });
        const { data: { user }, error: authError, } = await authClient.auth.getUser(token);
        if (authError || !user) {
            console.error("Token verification error:", authError);
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token",
            });
        }
        // Create a Supabase client that sends the user's JWT
        // with database requests so RLS can identify the user.
        const userSupabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
        req.userId = user.id;
        req.supabase = userSupabase;
        next();
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({
            success: false,
            error: "Authentication failed",
        });
    }
};
exports.authenticateUser = authenticateUser;
