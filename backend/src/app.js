import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';

// Import routes
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';
import entryRoutes from './routes/entry.routes.js';
import montageRoutes from './routes/montage.routes.js';
import collegeRoutes from './routes/college.routes.js';
import privateMessageRoutes from './routes/privateMessage.routes.js';
import authRoutes from './routes/auth.routes.js';
import imageProxyRoutes from './routes/imageProxy.routes.js';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/montages', montageRoutes);
app.use('/api/admin/colleges', collegeRoutes);
app.use('/api/messages', privateMessageRoutes);
app.use('/api/images', imageProxyRoutes);

// Token expiration middleware
app.use((err, req, res, next) => {
    if (err && err.tokenExpired) {
        return res.status(401).json({
            success: false,
            message: "Access token expired",
            errors: [],
            tokenExpired: true
        });
    }
    next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export default app;


