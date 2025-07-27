import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      navigate("/"); // Redirect to home after successful registration
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-base mb-8 text-gray-600">Join StitchSense today</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    required 
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    required 
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
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
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  required 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-purple-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            
            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account? {" "}
              <Link to="/login" className="text-purple-500 no-underline font-medium hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
        
        {/* Right Panel */}
        <div className="flex-1 bg-gradient-to-br from-purple-500 to-purple-400 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-4xl font-bold mb-4">Join StitchSense!</h1>
            <p className="text-lg opacity-90">Create your account to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
