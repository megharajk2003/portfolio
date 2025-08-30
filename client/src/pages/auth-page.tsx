import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react"; // Added User icon for names

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [isLoginView, setIsLoginView] = useState(true);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLoginView) {
        await loginMutation.mutateAsync(loginForm);
      } else {
        await registerMutation.mutateAsync(registerForm);
      }
      navigate("/dashboard");
    } catch (error) {
      console.error(
        isLoginView ? "Login failed:" : "Registration failed:",
        error
      );
      // Implement a more user-friendly error display here (e.g., a toast notification)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-blue-600 via-indigo-100 to-violet-500 dark:from-gray-900 dark:via-blue-800 dark:to-gray-900 overflow-hidden">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white  dark:bg-gradient-to-br dark:from-gray-700 dark:via-black-400 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side - Auth Form */}
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none ">
          {/* Top-left */}
          <div className="absolute -top-40 -left-32 w-80 h-80 gradient-primary rounded-full opacity-20 animate-pulse-slow"></div>

          {/* Top-right */}
          <div className="absolute -top-20 right-10 w-64 h-64 gradient-success rounded-full opacity-20 animate-pulse-slow delay-1000"></div>

          {/* Mid-left (avoiding center) */}
          <div className="absolute top-1/3 -left-28 w-56 h-56 gradient-warning rounded-full opacity-15 animate-pulse-slow delay-1500"></div>

          {/* Mid-right (avoiding center) */}
          <div className="absolute top-20 -right-28 w-72 h-72 gradient-info rounded-full opacity-15 animate-pulse-slow delay-2000"></div>

          {/* Bottom-left */}
          <div className="absolute bottom-12 -left-16 w-64 h-64 gradient-danger rounded-full opacity-10 animate-pulse-slow delay-1500"></div>

          {/* Bottom-right */}
          <div className="absolute -bottom-32 right-0 w-96 h-96 gradient-success rounded-full opacity-20 animate-pulse-slow delay-3000"></div>
        </div>

        <div className="p-8 md:p-12">
          <h1 className="text-2xl font-bold text-gray-800  dark:text-white">
            {isLoginView ? "Welcome Back!" : "Hello!"}
          </h1>
          <p className="text-gray-600 mt-2 dark:text-white">
            {isLoginView ? "Sign in to continue" : "Sign up to your account"}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Conditional Fields for Registration */}
            {!isLoginView && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={registerForm.firstName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        firstName: e.target.value,
                      })
                    }
                    required
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={registerForm.lastName}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        lastName: e.target.value,
                      })
                    }
                    required
                    className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Email Input (Common) */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="E-mail"
                value={isLoginView ? loginForm.email : registerForm.email}
                onChange={(e) =>
                  isLoginView
                    ? setLoginForm({ ...loginForm, email: e.target.value })
                    : setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                }
                required
                className="pl-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            {/* Password Input (Common) */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={isLoginView ? loginForm.password : registerForm.password}
                onChange={(e) =>
                  isLoginView
                    ? setLoginForm({ ...loginForm, password: e.target.value })
                    : setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                }
                required
                className="pl-10 pr-10 h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Remember Me & Forgot Password (Login only) */}
            {isLoginView && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember-me"
                    className="border-gray-300 checked:bg-purple-600"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="font-normal text-gray-600 dark:text-white"
                  >
                    Remember me
                  </Label>
                </div>
                <a
                  href="#"
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors dark:text-white"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 transition-opacity text-base font-bold"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {(loginMutation.isPending || registerMutation.isPending) && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {isLoginView ? "SIGN IN" : "SIGN UP"}
            </Button>
          </form>

          {/* Toggle Link */}
          <p className="text-center text-sm text-gray-600 mt-8 dark:text-white">
            {isLoginView
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLoginView(!isLoginView);
                setShowPassword(false); // Reset password visibility when switching views
              }}
              className="font-medium text-purple-600 hover:text-purple-500 dark:text-white hover:underline transition-colors"
            >
              {isLoginView ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        {/* Right side - Welcome Section with new dynamic background elements */}
        <div
          className="relative hidden lg:flex flex-col items-center justify-center p-12 text-white text-center overflow-hidden
             bg-gradient-to-tr from-purple-600 to-blue-500 
             dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-800 dark:to-gray-900"
        >
          {/* Background elements */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-5 right-5 w-60 h-60 bg-gradient-to-tl from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow delay-500"></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow delay-1000"></div>

          <div className="z-10 relative">
            <h2 className="text-4xl font-extrabold mb-4">Build Your Future</h2>
            <p className="mt-4 opacity-90 max-w-sm mx-auto text-lg leading-relaxed">
              Create a stunning professional portfolio while leveling up your
              skills through gamified learning modules.
            </p>
            <ul className="space-y-3 text-left mt-8 max-w-xs mx-auto text-lg">
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                <span>Professional portfolio management</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                <span>Gamified learning experience</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                <span>Track your progress and achievements</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-white rounded-full flex-shrink-0"></div>
                <span>Public portfolio sharing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
