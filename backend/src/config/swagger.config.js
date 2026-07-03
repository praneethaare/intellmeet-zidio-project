import swaggerJsdoc from "swagger-jsdoc";
import credentials from "./config.js";


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Meeting Platform API",
      version: "1.0.0",
      description: "API Documentation",
    },
    servers: [
      {
        url: `http://localhost:${credentials.port || 5000}/api`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;