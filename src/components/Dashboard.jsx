import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setError("Email not found. Please log in.");
      return;
    }

    // Отримання userId за email
    fetch(`http://localhost:5000/user-id/${email}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user ID");
        }
        return response.json();
      })
      .then((data) => {
        const userId = data.userId;

        // Отримання балансу за userId
        return fetch(`http://localhost:5000/balance/${userId}`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }
        return response.json();
      })
      .then((data) => setBalance(data.balance))
      .catch((error) => setError(error.message));
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Ваш баланс: {balance} грн</h1>
      {error && <p className="error">{error}</p>}
      <div className="buttons">
        <Link to="/history">
          <button>Історія транзакцій</button>
        </Link>
        <button>Поповнити рахунок</button>
      </div>
    </div>
  );
}

export default Dashboard;
