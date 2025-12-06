import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./adminlogin.css";
import HeartBG from "../../assets/heart-green.jpg";

const AdminLogin = ({ setCurrentPage }) => {
  const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const snap = await getDoc(doc(db, "users", user.uid));

      if (!snap.exists()) {
        setError("No Firestore record found.");
        return;
      }

      const role = snap.data().role?.toLowerCase();

      // ⭐ ROLE-BASED REDIRECTS
      if (role === "super_admin") {
        setCurrentPage("admin-dashboard");
      }
      else if (role === "pharmacy_manager") {
        setCurrentPage("pharmacy-dashboard");
      }
      else if (role === "rider") {
        setCurrentPage("rider-dashboard");   // ⭐ NEWLY ADDED
      }
      else {
        setError("Unauthorized role.");
      }

    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-login-wrapper"
      style={{ backgroundImage: `url(${HeartBG})` }}
    >
      <div className="bg-overlay"></div>

      <div className="bg-pill pill-top-left"></div>
      <div className="bg-pill pill-top-right"></div>
      <div className="bg-pill pill-bottom-left"></div>
      <div className="bg-pill pill-bottom-right"></div>

      <div className="glass-login-card">
        <h2 className="admin-login-title">Login</h2>
        <p className="admin-login-subtitle">Access Your Dashboard</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="admin-form-label">Email Address</label>
            <input
              type="email"
              className="admin-form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="admin-form-label">Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="admin-form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="admin-login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
