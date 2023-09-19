import express, { type Request, type Response } from 'express';

import { router } from '@routes/routes';
import { AppError } from '@errors/AppError';

const app = express();
app.use(express.json());

app.use(router);

app.disable('x-powered-by');

app.use((err: Error, _: Request, response: Response) => {
  if (err instanceof AppError) {
    return response.status(err.statusCode).json({
      message: err.message,
    });
  }

  return response.status(500).json({
    status: 'error',
    message: `Internal server error - ${err.message}`,
  });
});

export { app };
