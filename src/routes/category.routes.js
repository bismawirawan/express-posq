const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", categoryController.getCategories);
/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Beverage
 *     responses:
 *       200:
 *         description: Category created
 */
router.post("/", categoryController.createCategory);

module.exports = router;