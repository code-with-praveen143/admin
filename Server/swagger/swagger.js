// swagger.js
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // OpenAPI version
    info: {
      title: "API Documentation", // Title of your API
      version: "1.0.0", // Version
      description: "API documentation for your application", // Description
    },
    servers: [
      {
        url: "http://localhost:5001", // Base URL of your API
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to the API docs
};

// Generate swagger specification
const swaggerSpecs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi, // Ensure this is exported correctly
  swaggerSpecs,
};
