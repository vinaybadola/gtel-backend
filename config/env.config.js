import { config } from 'dotenv';
config();

export const dbUri = process.env.MONGO_URI;
export const port = process.env.PORT || 8000;

export const whatsappApiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API;
export const whatsappType = process.env.WHATSAPP_TYPE_SOURCE || "gtel-website-inquiry";
export const whatsappSupportType = process.env.WHATSAPP_SUPPORT_TYPE || "new connection";

export const smtpHost = process.env.SMTP_HOST;
export const smtpPort = process.env.SMTP_PORT;
export const emailUser = process.env.EMAIL;
export const emailPassword = process.env.EMAIL_PASSWORD;
export const fromEmail = process.env.FROM_EMAIL;
export const appName = process.env.APP_NAME;
export const environment = process.env.NODE_ENV || 'DEVELOPMENT';

export const InternalEmailSupport = process.env.INTERNAL_EMAIL_SUPPORT;
export const InternalEmailSales = process.env.INTERNAL_EMAIL_SALES;

export const allowedOrigins = [
    "http://localhost:3000",
    "https://gtel.in",
    "https://gispl.net",
];

export const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
export const allowedCredentials = true;
export const allowedHeaders = ["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"];
export const allowedExposedHeaders = ["Authorization"];

export const captchaSecretKey = process.env.CAPTCHA_SECRET_KEY;
export const botBlockerEnable = process.env.BOT_BLOCKER_ENABLE === 'true';
export const verificationUrl = process.env.VERIFICATION_URL;


export const geoFeedServer = process.env.GEO_FEED_SERVER;
export const geoFeedServerPath = process.env.GEO_FEED_SERVER_BASE_PATH;