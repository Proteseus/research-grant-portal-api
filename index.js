import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // HTTP request logger
import bodyParser from 'body-parser'; // Parse incoming request bodies
import authRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import fuelRecordRoutes from './routes/fuelRoutes.js';

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:4000", "http://localhost:8081", "https://fueler.lewibelayneh.com"], // Frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies if needed
}));
app.use(morgan('dev')); // Log HTTP requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies


app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicles', fuelRecordRoutes); // Fuel records depend on vehicles
app.get('/api/health', async (req, res) => {
    res.status(200).send({ "msg": "Welcome to fueler" });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server running on http://localhost:3000');
});
