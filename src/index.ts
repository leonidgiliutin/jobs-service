import express from 'express';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(errorHandler);

app.get('/', (_req, res) => {
  res.send('Jobs service API');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import userRoutes from './routes/jobsRoutes';
app.use('/api', userRoutes);

