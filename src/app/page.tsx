"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function PaymentInfoPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({
    email: "",
    company: "",
  });

  const validateEmail = (email: string) => {
    // Ensure the email is a business email (not personal)
    const businessEmailPattern = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)+(com|org|net|edu|gov)$/;
    return businessEmailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const email = (document.getElementById("email") as HTMLInputElement).value;
  const company = (document.getElementById("company") as HTMLInputElement).value;

  // Validation logic
  let valid = true;
  const errors = {
    email: "",
    company: "",
  };

  if (!email || !validateEmail(email)) {
    errors.email = "Please enter a valid business email.";
    valid = false;
  }
  if (!company) {
    errors.company = "Company name is required.";
    valid = false;
  }

  setFormErrors(errors);

  if (!valid) return; // Stop the process if there's an error

  setLoading(true);
  setError("");

  try {
    // ✅ Send email + company to backend
    const res = await fetch("/api/create-setup-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company }),
    });

    if (!res.ok) {
      throw new Error("Failed to create setup intent");
    }

    const { clientSecret } = await res.json();

    if (!stripe) {
      setError("Stripe.js has not loaded yet. Please try again in a moment.");
      setLoading(false);
      return;
    }

    if (!elements) {
      setError("Stripe Elements has not loaded yet. Please try again in a moment.");
      setLoading(false);
      return;
    }

    const result = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: {
          email,
          name: company, // using company name as "name"
        },
      },
    });

    if (result.error) {
      setError(result.error.message || "Something went wrong.");
    } else {
      setSuccess(true);
    }
  } catch (err) {
    console.error(err);
    setError("Unexpected error. Try again.");
  }

  setLoading(false);
};

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 text-center">
          <div className="flex justify-center mb-6">
            <svg
              className="w-20 h-20 text-green-500 animate-scaleIn"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method Saved</h2>
          <p className="text-gray-500 text-sm">
            Your card has been securely stored for future billing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Logo" className="mx-auto h-16 object-contain" />
          <h1 className="text-2xl font-bold text-[#121212] mt-4">Secure Payment Setup</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your details to securely save your card for future billing.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <img src="/email.png" alt="Email Icon" className="w-5 h-5" />
              </span>
              <input
                type="email"
                id="email"
                placeholder="you@company.com"
                required
                className="w-full border border-gray-300 pl-10 pr-3 py-3 rounded text-[#121212] focus:ring-2 focus:ring-[#635BFF] focus:border-[#635BFF] sm:text-sm"
              />
            </div>
            {formErrors.email && <p className="text-red-500 text-xs mt-2">{formErrors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                <img src="/company.png" alt="Logo" className="w-5 h-5" />
              </span>
              <input
                type="text"
                id="company"
                placeholder="Widgion Inc."
                required
                className="w-full border border-gray-300 pl-10 pr-3 py-3 rounded text-[#121212] focus:ring-2 focus:ring-[#635BFF] focus:border-[#635BFF] sm:text-sm"
              />
            </div>
            {formErrors.company && <p className="text-red-500 text-xs mt-2">{formErrors.company}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Card</label>
            <div className="mt-1 p-3 border rounded-lg bg-gray-50 flex items-center gap-2">
              <CardElement className="w-full" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#635BFF] text-white py-4 rounded-lg text-sm hover:bg-[#4F46E5] transition cursor-pointer flex items-center justify-center gap-2"
            disabled={loading || !stripe}
          >
            {loading ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-loader h-5 w-5 animate-spin"
                >
                  <path d="M12 2v4"></path>
                  <path d="m16.2 7.8 2.9-2.9"></path>
                  <path d="M18 12h4"></path>
                  <path d="m16.2 16.2 2.9 2.9"></path>
                  <path d="M12 18v4"></path>
                  <path d="m4.9 19.1 2.9-2.9"></path>
                  <path d="M2 12h4"></path>
                  <path d="m4.9 4.9 2.9 2.9"></path>
                </svg>
                Saving...
              </>
            ) : (
              "Save Payment Method"
            )}
          </button>
        </form>

        {error && <p className="text-center text-sm text-red-500 mt-4">{error}</p>}

        <p className="text-xs text-center text-gray-400 mt-6">
          🔒 Your payment details are encrypted and stored securely by Stripe.
        </p>
      </div>
    </div>
  );
}
