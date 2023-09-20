import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import 'express-async-errors';

import { router } from '@routes/routes';
import { AppError } from '@errors/AppError';
import { storageConfig } from '@config/storage';

const { uploads } = storageConfig.folders;

const app = express();
app.use(express.json());

app.use(router);
app.disable('x-powered-by');
app.use('/files', express.static(uploads));

app.use((err: Error, _: Request, response: Response, next: NextFunction) => {
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
