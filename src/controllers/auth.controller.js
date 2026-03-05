const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
			email,
		]);

		if (users.length === 0) {
			return res.status(401).json({
				message: "Email atau password salah",
			});
		}

		const user = users[0];

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res.status(401).json({
				message: "Email atau password salah",
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
			status: "success",
			message: "Login success",
			token: token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};