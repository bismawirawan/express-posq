const pool = require("../config/db");

exports.createTransaction = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId, paymentMethod, paidAmount, items } = req.body;

    // Basic validation
    if (!userId || !paymentMethod || !paidAmount || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    await connection.beginTransaction();

    const invoiceNumber = `INV-${Date.now()}`;

    // Insert transaction (temporary total 0)
    const [transactionResult] = await connection.execute(
      `INSERT INTO transactions 
      (invoice_number, user_id, total_amount, paid_amount, change_amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [invoiceNumber, userId, 0, 0, 0, paymentMethod]
    );

    const transactionId = transactionResult.insertId;

    let totalAmount = 0;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error("Invalid item data");
      }

      const [products] = await connection.execute(
        "SELECT * FROM products WHERE id = ?",
        [item.productId]
      );

      if (products.length === 0) {
        throw new Error(`Product with id ${item.productId} not found`);
      }

      const product = products[0];

      if (product.stock < item.quantity) {
        throw new Error(`Stock for product ${product.name} is not enough`);
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      // Insert transaction detail
      await connection.execute(
        `INSERT INTO transaction_details
        (transaction_id, product_id, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [transactionId, item.productId, product.price, item.quantity, subtotal]
      );

      // Update stock
      await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.productId]
      );

      // Insert stock log
      await connection.execute(
        `INSERT INTO stock_logs (product_id, type, quantity, note)
         VALUES (?, 'OUT', ?, ?)`,
        [item.productId, item.quantity, `Penjualan ${invoiceNumber}`]
      );
    }

    if (paidAmount < totalAmount) {
      throw new Error("Paid amount is less than total amount");
    }

    const changeAmount = paidAmount - totalAmount;

    // Update total transaction
    await connection.execute(
      `UPDATE transactions 
       SET total_amount = ?, paid_amount = ?, change_amount = ?
       WHERE id = ?`,
      [totalAmount, paidAmount, changeAmount, transactionId]
    );

    await connection.commit();

    const data = {
      invoice_no: invoiceNumber,
      total : totalAmount,
      paid_amount: paidAmount,
      change_amount: changeAmount,
    };

    res.status(201).json({
      status: "success",
      message: "Transaction success",
      data: data
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};