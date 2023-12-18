import cors from 'cors';
import express from 'express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import routerV1 from './routes/apiv1.js';

const app = express();
const PORT = process.env.PORT || 5000;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vinscan API',
      version: '1.0.0',
      description: 'Vinscan API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./index.js', './controllers/*.js'],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/v1', routerV1);

app.listen(PORT, () => {
  console.log(`Server up and running on port http://localhost:${PORT}`);
});
