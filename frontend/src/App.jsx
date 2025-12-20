import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/authStore.js";
import { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-600">Tailwind works</h1>
    </>
  );
}

export default App;
