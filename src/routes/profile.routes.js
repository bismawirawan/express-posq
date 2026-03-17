const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth.middleware");

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get profile user yang sedang login
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get profile success
 *       401:
 *         description: Token required atau invalid
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/", authMiddleware, profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update profile user yang sedang login
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *                 example: Super Admin Updated
 *               username:
 *                 type: string
 *                 example: superadmin2
 *               email:
 *                 type: string
 *                 example: admin2@pos.com
 *               phone_nu:
 *                 type: string
 *                 example: "081234567890"
 *               image_profile:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *               password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Update profile success
 *       400:
 *         description: Tidak ada data yang diupdate
 *       401:
 *         description: Token required atau invalid
 *       404:
 *         description: User tidak ditemukan
 *       409:
 *         description: Email atau username sudah digunakan
 */
router.put("/", authMiddleware, profileController.updateProfile);

module.exports = router;
