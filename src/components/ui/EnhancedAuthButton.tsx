"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./Button";

interface SignInFormProps {
  onToggle: () => void;
  isSignUp: boolean;
}

function SignInForm({ onToggle, isSignUp }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (isSignUp) {
      // For sign up, we'll create the user first
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        });

        if (response.ok) {
          // After successful registration, sign them in
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError("Failed to sign in after registration");
          }
        } else {
          const data = await response.json();
          setError(data.message || "Registration failed");
        }
      } catch (error) {
        setError("Registration failed");
      }
    } else {
      // Sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignUp && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Your name"
            required
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
        {isSignUp ? "Create Account" : "Sign In"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggle}
          className="text-sm text-purple-600 hover:text-purple-700">
          {isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            More options coming soon!
          </span>
        </div>
      </div>

      {/* Temporarily disabled OAuth options */}
      {/* 
      <div className="space-y-2">
        <Button
          type="button"
          onClick={() => signIn("google")}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
        >
          Sign in with Google
        </Button>
      </div>
      */}
    </form>
  );
}

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isSignUp, setIsSignUp] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {session.user?.name || session.user?.email}!
        </span>
        <Button
          onClick={() => signOut()}
          className="bg-red-500 hover:bg-red-600">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <SignInForm onToggle={() => setIsSignUp(!isSignUp)} isSignUp={isSignUp} />
  );
}
