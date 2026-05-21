const express = require("express");
const router = express.Router();
const savingsController = require("../controllers/savings.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/savings:
 *   get:
 *     summary: Get savings user yang sedang login
 *     tags: [Savings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get savings success
 *       401:
 *         description: Token required atau invalid
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/", authMiddleware, savingsController.getSavings);

module.exports = router;