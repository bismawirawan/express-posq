const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRoutes = require("./routes/auth.routes");

app.use("/api/auth", authRoutes);

const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const transactionRoutes = require("./routes/transaction.routes");

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

module.exports = app;