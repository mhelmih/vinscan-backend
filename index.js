const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const routerV1 = require('./routes/apiv1.js');

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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

app.use(express.json());
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use('/api/v1', routerV1);

app.listen(PORT, () => {
  console.log(`Server up and running on port http://localhost:${PORT}`);
});
