const pool = require("../config/db");

exports.getProducts = async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM products");
  res.json({
    status: "success",
    message: "successfully get product",
    data: rows,
  });
};

exports.getProductById = async (req, res) => {
  const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [
    req.params.id,
  ]);

  res.json({
    status: "success",
    message: "successfully get product",
    data: rows[0],
  });
};

exports.createProduct = async (req, res) => {
  const { category_id, name, barcode, price, stock } = req.body;

  const [result] = await pool.execute(
    `INSERT INTO products (category_id, name, barcode, price, stock)
     VALUES (?, ?, ?, ?, ?)`,
    [category_id, name, barcode, price, stock],
  );

  res.json({
    status: "success",
    message: "Product created",
    data: result.insertId,
  });
};

exports.updateProduct = async (req, res) => {
  const { name, price, stock } = req.body;

  await pool.execute(
    `UPDATE products
     SET name=?, price=?, stock=?
     WHERE id=?`,
    [name, price, stock, req.params.id],
  );

  res.json({
    status: "success",
    message: "Product updated",
  });
};

exports.deleteProduct = async (req, res) => {
  await pool.execute("DELETE FROM products WHERE id=?", [req.params.id]);

  res.json({
    status: "success",
    message: "Product deleted",
  });
};
