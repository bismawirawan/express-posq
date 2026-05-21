const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.getSavings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      "SELECT id, user_id, amount, savings_type, savings_date FROM users WHERE id = ?",
      [userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User tidak ditemukan",
      });
    }

    const user = rows[0];
    user.is_active = user.is_active === 1;

    res.json({
      status: true,
      message: "Get savings success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status:false, error: error.message });
  }
};