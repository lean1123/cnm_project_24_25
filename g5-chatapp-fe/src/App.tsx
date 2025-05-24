import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { TooltipProvider } from "./components/ui/tooltip";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./store/useAuthStore";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";

function App() {
  const { user, hasHydrated } = useAuthStore();

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }
  return (
    <div className="h-screen w-screen">
      <TooltipProvider>
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to={"/"} />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterPage /> : <Navigate to={"/"} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
        </Routes>
      </TooltipProvider>
      <Toaster />
    </div>
  );
}

export default App;
