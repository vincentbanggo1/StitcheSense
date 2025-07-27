import { RouterProvider } from "react-router";
import { router } from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import { ProductsProvider } from "./contexts/ProductsContext";

function App() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <RouterProvider router={router} />
      </ProductsProvider>
    </AuthProvider>
  );
}

export default App
