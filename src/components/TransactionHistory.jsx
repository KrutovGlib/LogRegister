import React from 'react';
import "../styles/TransactionHistory.css";


function TransactionHistory() {
  const transactions = [
    { id: 1, date: '2024-12-20', amount: -200, description: 'Купівля в магазині' },
    { id: 2, date: '2024-12-21', amount: 1500, description: 'Поповнення рахунку' },
    { id: 3, date: '2024-12-22', amount: -300, description: 'Оплата послуг' },
  ];

  return (
    <div className="history-container">
      <h1>Історія транзакцій</h1>
      <table>
        <thead>
          <tr>
            <th>Дата</th>
            <th>Опис</th>
            <th>Сума</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td>{tx.description}</td>
              <td>{tx.amount} грн</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionHistory;
