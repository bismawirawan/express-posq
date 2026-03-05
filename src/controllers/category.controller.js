const pool = require("../config/db");

exports.getCategories = async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM categories");
  res.json(rows);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;

  const [result] = await pool.execute(
    "INSERT INTO categories (name) VALUES (?)",
    [name]
  );

  res.json({
    status: "success",
    message: "Category created",
    data: result.insertId,
  });
};