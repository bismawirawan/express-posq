const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password, role, is_active } = req.body;
    const allowedRoles = ["ADMIN", "CASHIER"];
    const userRole = role || "CASHIER";

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "name, email, dan password wajib diisi",
      });
    }

    if (!username) {
      return res.status(400).json({
        status: false,
        message: "username wajib diisi",
      });
    }

    if (!is_active) {
      return res.status(400).json({
        status: false,
        message: "status akun wajib diisi",
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        status: false,
        message: "role harus ADMIN atau CASHIER",
      });
    }

    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: false,
        message: "Email sudah terdaftar",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (name, username, email, password, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, username, email, hashedPassword, userRole, is_active],
    );

    res.status(201).json({
      status: true,
      message: "Register success",
      data: {
        id: result.insertId,
        name,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        status: false,
        message: "Email atau password salah",
        data: {},
      });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Email atau password salah",
        data: {},
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      "SECRET_KEY",
      { expiresIn: "8h" },
    );

    res.json({
      status: true,
      message: "Login success",
      data: {
        access_token: token,
        refresh_token: "",
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};