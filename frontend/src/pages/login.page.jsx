import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { TextInput } from "../components/inputs.jsx";
import { useAuthStore } from "../stores/auth.store.js";
import { useTranslation } from "react-i18next";
import Button from "../components/button.jsx";

const LoginPage = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="md:max-w-lg max-w-md  w-full bg-white backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-2"
    >
      <div className="md:p-8 p-5">
        <h2 className="mb-6 text-center bg-clip-text">
          {t("login_page.title")}
        </h2>
        <form className="space-y-5" onSubmit={handleLogin}>
          <TextInput
            icon={Mail}
            type="text"
            placeholder={t("login_page.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextInput
            className="w-full"
            icon={Lock}
            type="password"
            placeholder={t("login_page.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* <div className="flex items-center mb-6">
            <Link
              to={"/forgot-password"}
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div> */}

          {error && <p className="text-red-500 font-semibold mb-2"> {error}</p>}
          <Button
            buttonSize="large"
            buttonType="primary"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              t("login_page.login_button_label")
            )}
          </Button>
        </form>
      </div>
      {/* <div className="px-8 py-4 bg-white-shadow  flex justify-center">
        <p className="text-sm text-gray-400">
          Don't have an account? {""}
          <Link to={"/signup"} className="text-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </div> */}
    </motion.div>
  );
};

export default LoginPage;
