import express from 'express';
import config from './config';
import apiV1 from './api/v1/index.route';
import cors from "cors";

const app = express();

app.use(express.json());

/**
 * CORS configuration
 */
app.use(
    cors({
      origin: config.clientUrl, // allow CORS
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true, // allow session cookie from browser to pass through
    })
  );

app.get('/', (_req, res) => {
    res.send('Hello World!');
});

app.use('/api/v1', apiV1);

app.listen(3000, () => {
    console.log(`Backend stock app listening on port ${config.portApi}`);
});