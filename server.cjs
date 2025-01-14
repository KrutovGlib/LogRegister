const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Client } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "BankDB",
  password: "12345",
  port: 3000,
});

(async () => {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");
  } catch (err) {
    console.error("Failed to connect to PostgreSQL", err.stack);
  }
})();

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Перевірка, чи користувач вже існує
  const userCheckQuery = "SELECT * FROM users WHERE email = $1";
  client.query(userCheckQuery, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Додати нового користувача в таблицю users
    const insertUserQuery =
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id";
    client.query(insertUserQuery, [name, email, password], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error saving user" });
      }

      const userId = result.rows[0].id;

      // Додати запис в таблицю balance
      const insertBalanceQuery =
        "INSERT INTO balance (user_id, balance) VALUES ($1, $2)";
      client.query(insertBalanceQuery, [userId, 0], (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Error creating initial balance" });
        }

        res.status(201).json({ message: "Registration successful!" });
      });
    });
  });
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    const user = result.rows[0];
    //const isPasswordValid = await bcrypt.compare(password, user.password);
    if(user.password !== password) {
      console.log("Passwords do not match:", user.password, password);
      return res.status(401).json({ message: "Invalid credentials!" });
    }
    // if (!isPasswordValid) {
    //   return res.status(401).json({ message: "Invalid credentials!" });
    // }

    res.status(200).json({ message: "Login successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

app.get("/balance/:userId", (req, res) => {
  const { userId } = req.params; // Отримуємо userId із параметрів запиту

  // SQL-запит для отримання балансу
  const getBalanceQuery = "SELECT balance FROM balance WHERE user_id = $1";

  client.query(getBalanceQuery, [userId], (err, result) => {
    if (err) {
      console.error(err); // Логування помилки
      return res.status(500).json({ message: "Error fetching balance" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Balance not found for the given user!" });
    }

    // Повертаємо баланс
    res.status(200).json({ balance: result.rows[0].balance });
  });
});



app.post("/topup", (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ message: "User ID and amount are required!" });
  }

  const updateBalanceQuery = "UPDATE balance SET balance = balance + $1 WHERE user_id = $2 RETURNING balance";
  client.query(updateBalanceQuery, [amount, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error updating balance" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ newBalance: result.rows[0].balance });
  });
});

app.get("/user-id/:email", (req, res) => {
  const { email } = req.params;

  const query = "SELECT id FROM users WHERE email = $1";
  client.query(query, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.status(200).json({ userId: result.rows[0].id });
  });
});


app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
