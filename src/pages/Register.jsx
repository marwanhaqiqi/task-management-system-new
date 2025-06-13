import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

const Register = () => {
  const navigate = useNavigate();

  // State for password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRetypePasswordVisible, setIsRetypePasswordVisible] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [loading, setLoading] = useState(false);

  // API Base URL
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

  const togglePasswordVisible = () => setIsPasswordVisible((prev) => !prev);
  const toggleRetypePasswordVisible = () =>
    setIsRetypePasswordVisible((prev) => !prev);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate password match
    if (password !== retypePassword) {
      alert("Password tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Registrasi berhasil! Silahkan login.");
        navigate("/login");
      } else {
        alert("Registrasi gagal: " + result.message);
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        src="/background.mp4"
        type="video/mp4"
      />

      {/* Register form content */}
      <div className="relative z-10 flex flex-col gap-6 shadow-2xl bg-opacity-80 p-8 rounded-md max-w-md w-full">
        <div>
          <h1 className="text-white mb-3 font-bold text-2xl">Register</h1>
          <p className="text-white text-sm">
            Silahkan Masukkan User Email dan Password Anda!
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 font-medium text-white"
            >
              Nama
            </label>
            <input
              type="text"
              id="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan Username"
              className="p-3 w-full ring-1 ring-white rounded-md focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email"
              className="p-3 w-full ring-1 ring-white rounded-md focus:outline-none"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-white"
            >
              Password
            </label>
            <div className="relative w-full max-w-sm">
              <input
                type={isPasswordVisible ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full p-3 pr-10 rounded-lg shadow-sm ring-1 ring-white focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisible}
                className="absolute inset-y-0 right-3 flex items-center p-2 focus:outline-none"
              >
                {isPasswordVisible ? (
                  <Eye className="w-5 h-5 text-white hover:text-black" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white hover:text-black" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="retypepassword"
              className="block mb-2 font-medium text-white"
            >
              Retype Password
            </label>
            <div className="relative w-full max-w-sm">
              <input
                type={isRetypePasswordVisible ? "text" : "password"}
                id="retypepassword"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                placeholder="Masukkan Password"
                className="w-full p-3 pr-10 rounded-lg shadow-sm ring-1 ring-white focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={toggleRetypePasswordVisible}
                className="absolute inset-y-0 right-3 flex items-center p-2 focus:outline-none"
              >
                {isRetypePasswordVisible ? (
                  <Eye className="w-5 h-5 text-white hover:text-black" />
                ) : (
                  <EyeOff className="w-5 h-5 text-white hover:text-black" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-white">Sudah memiliki akun?</p>
            <Link to="/login" className="underline text-black">
              Login
            </Link>
          </div>
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="mt-2 w-full font-medium text-center py-3 bg-black text-white rounded-md active:scale-90 hover:opacity-80 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
