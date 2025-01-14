import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate(); // Хук для навігації

  const validate = () => {
    const errors = {};
    if (!formData.email.includes("@")) errors.email = "Invalid email format!";
    if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters!";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userEmail", formData.email);
        setSuccessMessage("Login successful!");
        setTimeout(() => {
          navigate("/dashboard"); // Перехід на сторінку "dashboard"
        }, 2000);
      } else {
        setErrors({ general: data.message });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        {errors.general && <p className="error">{errors.general}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        <button type="submit">Login</button>
      </form>
      <p className="newAcc">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;
