import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'
import menuRoutes from './routes/menuRoutes.js'
import restaurantRoutes from "./routes/restaurantRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use("/restaurant", restaurantRoutes); 
app.use('/restaurant', menuRoutes);
app.use("/payments", paymentRoutes);

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

