import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/"); // Redirect to home after successful login
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100 font-sans">
      <div className="flex w-full shadow-2xl rounded-xl overflow-hidden m-5 bg-white">
        {/* Left Panel */}
        <div className="flex-1 px-12 py-16 flex flex-col justify-center bg-white">
          <div className="flex items-center mb-12">
            <div className="w-4 h-4 bg-white rounded-sm mr-3"></div>
            <div className="text-4xl font-semibold font-['Tinos']">StitchSense</div>
          </div>
          
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-base mb-10 text-gray-600">Sign in to your account</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                />
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-[18px] h-[18px] mr-2 accent-purple-500" 
                  />
                  <label className="text-sm text-gray-600">Remember me</label>
                </div>
                <a href="#" className="text-purple-500 no-underline text-sm font-medium hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-purple-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>
            
            <p className="text-center mt-8 text-sm text-gray-600">
              Don't have an account? {" "}
              <Link to="/signup" className="text-purple-500 no-underline font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="flex-1 bg-gradient-to-br from-purple-500 to-purple-400 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-lg opacity-90">Sign in to continue to StitchSense</p>
          </div>
          {/* Decorative elements can be added here */}
        </div>
      </div>
    </div>
  )
}

export default Login
