const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pedidos + Estoque + Frete",
      version: "1.0.0",
      description: "API REST com autenticação JWT, estoque transacional e frete estimado via ViaCEP"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/server.js"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
