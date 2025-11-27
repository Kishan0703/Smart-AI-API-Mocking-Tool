"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Shield,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Service = "openai" | "anthropic" | "gemini" | "stripe" | "github";

interface ServiceOption {
  value: Service;
  label: string;
  placeholder: string;
  icon: string;
  color: string;
}

const services: ServiceOption[] = [
  {
    value: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    icon: "🤖",
    color: "bg-green-500",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    icon: "🧠",
    color: "bg-orange-500",
  },
  {
    value: "gemini",
    label: "Google Gemini",
    placeholder: "AIza...",
    icon: "✨",
    color: "bg-blue-500",
  },
  {
    value: "stripe",
    label: "Stripe",
    placeholder: "sk_live_... or sk_test_...",
    icon: "💳",
    color: "bg-purple-500",
  },
  {
    value: "github",
    label: "GitHub",
    placeholder: "ghp_... or github_pat_...",
    icon: "🐙",
    color: "bg-gray-800",
  },
];

interface TestResult {
  valid: boolean;
  status: number;
  responseTime: number;
  error?: string;
}

export default function ApiKeyTesterPage() {
  const [selectedService, setSelectedService] = useState<Service>("openai");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);

  const selectedServiceOption = services.find((s) => s.value === selectedService)!;

  const handleTest = async () => {
    if (!apiKey.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: selectedService, apiKey: apiKey.trim() }),
      });

      const remaining = response.headers.get("X-RateLimit-Remaining");
      if (remaining) {
        setRateLimitRemaining(parseInt(remaining, 10));
      }

      const data: TestResult = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        valid: false,
        status: 0,
        responseTime: 0,
        error: "Failed to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey("");
    setResult(null);
    setShowKey(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-gray-900">API Key Tester</span>
              </div>
            </div>
            {rateLimitRemaining !== null && (
              <span className="text-sm text-gray-500">
                {rateLimitRemaining} tests remaining
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            API Key Tester
          </h1>
          <p className="text-lg text-gray-600 max-w-lg mx-auto">
            Quickly verify if your API keys are valid and working. Supports OpenAI, Anthropic, Gemini, Stripe, and GitHub.
          </p>
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-8">
          <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <strong>Secure Testing:</strong> Your API keys are never logged or stored. All validation happens server-side with a 10-second timeout.
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="font-bold text-gray-900 text-lg">Test Your API Key</h2>
            <p className="text-sm text-gray-500 mt-1">Select a service and paste your key to verify</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Service Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Select Service
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {services.map((service) => (
                  <button
                    key={service.value}
                    onClick={() => {
                      setSelectedService(service.value);
                      setResult(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                      selectedService === service.value
                        ? "border-indigo-500 bg-indigo-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-2xl">{service.icon}</span>
                    <span className={cn(
                      "font-medium text-sm",
                      selectedService === service.value ? "text-indigo-700" : "text-gray-700"
                    )}>
                      {service.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={selectedServiceOption.placeholder}
                  className="w-full px-4 py-3.5 pr-24 border-2 border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTest();
                  }}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    type="button"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClear}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      type="button"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Test Button */}
            <button
              onClick={handleTest}
              disabled={!apiKey.trim() || isLoading}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                apiKey.trim() && !isLoading
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Test API Key
                </>
              )}
            </button>

            {/* Results */}
            {result && (
              <div className={cn(
                "rounded-xl border-2 overflow-hidden animate-fade-in",
                result.valid
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              )}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {result.valid ? (
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                      <div>
                        <span className={cn(
                          "font-bold text-lg",
                          result.valid ? "text-green-700" : "text-red-700"
                        )}>
                          {result.valid ? "Valid API Key" : "Invalid API Key"}
                        </span>
                        <p className="text-sm text-gray-600">
                          {selectedServiceOption.label} API
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTest}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    >
                      <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                      Test Again
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <AlertTriangle className="w-4 h-4" />
                        Status Code
                      </div>
                      <span className="font-mono font-bold text-gray-900">{result.status}</span>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        Response Time
                      </div>
                      <span className="font-mono font-bold text-gray-900">{result.responseTime}ms</span>
                    </div>
                  </div>

                  {result.error && (
                    <div className="mt-4 p-3 bg-white/60 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Error Message</div>
                      <span className="text-sm font-medium text-red-700">{result.error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">💡 Tips</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Make sure you're using the correct key format for each service</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>OpenAI keys start with <code className="bg-gray-100 px-1 rounded">sk-</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Gemini keys start with <code className="bg-gray-100 px-1 rounded">AIza</code></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>Some services may show as valid even with rate limits or quota exceeded</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-500 font-bold">•</span>
              <span>You can test up to 10 keys per hour</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
