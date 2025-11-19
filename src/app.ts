import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import router from './app/routes';
import globalErrorHandler from './app/middleware/globalErrorhandler';
import notFound from './app/middleware/notfound';
import config from './app/config';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import logger from './app/utils/logger';

const app: Application = express();

// -------------------------
// Static Files Middleware
// -------------------------
app.use(express.static('public'));
app.use(
  '/public',
  express.static('public', {
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*'); // or set specific domains
    },
  })
);

// -------------------------
// Body & Cookie Parsers
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------------
// CORS Configuration
// -------------------------
const allowedOrigins = (config.CLIENT_CORS_ORIGIN || "").split(",").map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser clients
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// -------------------------
// Security Middlewares
// -------------------------
app.use(
  helmet({
    contentSecurityPolicy: false, // configure CSP if needed
  })
);

app.use(
  mongoSanitize({
    replaceWith: '_', // replaces $ and . in keys
  })
);

// -------------------------
// Logging Middleware
// -------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
});

// -------------------------
// Routes Middleware
// -------------------------
app.get('/', (_req: Request, res: Response) => {
  res.send('Server is running...');
});
app.use('/api/v1', router);

// -------------------------
// Logout Route
// -------------------------
app.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('loggedIn');
  return res.redirect('/');
});

// -------------------------
// Global Error Handling
// -------------------------
app.use(globalErrorHandler);
app.use(notFound);

export default app;
