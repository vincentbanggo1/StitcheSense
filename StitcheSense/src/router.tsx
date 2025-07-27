import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Gowns from "./pages/Gowns";
import WeddingGowns from "./pages/WeddingGowns";
import DebutGowns from "./pages/DebutGowns";
import ModernGowns from "./pages/ModernGowns";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductManager from "./pages/AdminProductManager";
import AIBodyMeasurement from "./pages/AIBodyMeasurement";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/gowns",
    element: <Gowns />,
  },
  {
    path: "/gowns/wedding",
    element: <WeddingGowns />,
  },
  {
    path: "/gowns/debut",
    element: <DebutGowns />,
  },
  {
    path: "/gowns/modern",
    element: <ModernGowns />,
  },
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/products",
    element: <AdminProductManager />,
  },
  {
    path: "/ai-measurement",
    element: <AIBodyMeasurement />,
  },
]);
