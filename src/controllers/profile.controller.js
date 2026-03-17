const pool = require("../config/db");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      "SELECT id, fullname, username, email, role, phone_nu, image_profile, is_active, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      status: true,
      message: "Get profile success",
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullname, username, email, phone_nu, image_profile, password } = req.body;

    const [existing] = await pool.execute("SELECT id FROM users WHERE id = ?", [userId]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User tidak ditemukan",
      });
    }

    if (email) {
      const [emailCheck] = await pool.execute(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({
          status: false,
          message: "Email sudah digunakan",
        });
      }
    }

    if (username) {
      const [usernameCheck] = await pool.execute(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, userId]
      );
      if (usernameCheck.length > 0) {
        return res.status(409).json({
          status: false,
          message: "Username sudah digunakan",
        });
      }
    }

    const fields = [];
    const values = [];

    if (fullname !== undefined) { fields.push("fullname = ?"); values.push(fullname); }
    if (username !== undefined) { fields.push("username = ?"); values.push(username); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email); }
    if (phone_nu !== undefined) { fields.push("phone_nu = ?"); values.push(phone_nu); }
    if (image_profile !== undefined) { fields.push("image_profile = ?"); values.push(image_profile); }
    if (password !== undefined) {
      const hashed = await bcrypt.hash(password, 10);
      fields.push("password = ?");
      values.push(hashed);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Tidak ada data yang diupdate",
      });
    }

    fields.push("updated_at = NOW()");
    values.push(userId);

    await pool.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [updated] = await pool.execute(
      "SELECT id, fullname, username, email, role, phone_nu, image_profile, is_active, created_at, updated_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      status: true,
      message: "Update profile success",
      data: updated[0],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
