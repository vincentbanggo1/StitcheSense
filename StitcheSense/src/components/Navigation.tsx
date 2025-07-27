import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface NavigationProps {
  showAuthButtons?: boolean;
}

function Navigation({ showAuthButtons = true }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#F2EFE7]">
      <p className="text-3xl font-bold text-black font-['Tinos']">StitchSense</p>
      <nav className="nav">
        <ul className="flex gap-12 list-none">
          <li>
            <Link 
              to="/" 
              className="text-black no-underline text-xl hover:text-cyan-500 transition-colors duration-300"
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className="text-black no-underline text-xl hover:text-cyan-500 transition-colors duration-300"
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/gowns" 
              className="text-black no-underline text-xl hover:text-cyan-500 transition-colors duration-300"
            >
              Gowns
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/admin" 
                className="text-black no-underline text-xl hover:text-cyan-500 transition-colors duration-300"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>
      {showAuthButtons && (
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              <span className="text-black font-medium">
                Welcome, {user?.first_name}!
              </span>
              <button 
                onClick={handleLogout}
                className="bg-[#213448] border-none px-4 py-2 rounded cursor-pointer hover:bg-[#0097a7] transition-colors duration-300 text-white font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="bg-[#213448] border-none px-4 py-2 rounded cursor-pointer hover:bg-[#0097a7] transition-colors duration-300">
                <Link 
                  to="/login" 
                  className="no-underline text-white font-bold"
                >
                  Login
                </Link>
              </button>
              <button className="bg-[#213448] border-none px-4 py-2 rounded cursor-pointer hover:bg-[#0097a7] transition-colors duration-300">
                <Link 
                  to="/signup" 
                  className="no-underline text-white font-bold"
                >
                  Sign Up
                </Link>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Navigation;
