import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginProp {
  userId: string;
}

export const Login = ({ userId }: LoginProp) => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Login API
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/signin`,
        { username, password }
      );

      const token = res.data.token;

      // Fetch avatar metadata
      const avatarRes = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/user/metadata/bulk?ids=["${userId}"]`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      const avatarId = avatarRes.data?.avatars?.[0]?.avatarId;

      if (!avatarId) {
        navigate(`/avatar/?signup_token=${token}`);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>Login</h2>

      {userId && <p>User ID: {userId}</p>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", width: "100%" }}
      />

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
      )}

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: "100%", padding: "10px" }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};