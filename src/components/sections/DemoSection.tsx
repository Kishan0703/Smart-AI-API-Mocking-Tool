"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeSnippet {
  language: string;
  label: string;
  code: string;
}

interface DemoSectionProps {
  endpointUrl?: string;
  children: React.ReactNode;
}

export function DemoSection({ endpointUrl, children }: DemoSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const codeSnippets: CodeSnippet[] = endpointUrl
    ? [
        {
          language: "curl",
          label: "cURL",
          code: `curl -X GET "${endpointUrl}"`,
        },
        {
          language: "javascript",
          label: "JavaScript",
          code: `const response = await fetch("${endpointUrl}");
const data = await response.json();
console.log(data);`,
        },
        {
          language: "python",
          label: "Python",
          code: `import requests

response = requests.get("${endpointUrl}")
data = response.json()
print(data)`,
        },
        {
          language: "typescript",
          label: "TypeScript",
          code: `interface User {
  id: string;
  name: string;
  email: string;
}

const response = await fetch("${endpointUrl}");
const data: User[] = await response.json();`,
        },
      ]
    : [];

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="demo" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
            Interactive Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Try It <span className="gradient-text">Right Now</span>
          </h2>
          <p className="text-xl text-gray-600">
            No signup required. Describe what you need and get a working API in seconds.
          </p>
        </div>

        {/* Main Demo Content - This wraps the existing components */}
        <div className="max-w-6xl mx-auto">
          {children}
        </div>

        {/* Code Snippets Section - Only show if we have an endpoint */}
        {endpointUrl && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              {/* Tab Header */}
              <div className="flex items-center gap-1 px-4 py-2 bg-gray-800 border-b border-gray-700 overflow-x-auto">
                {codeSnippets.map((snippet, index) => (
                  <button
                    key={snippet.language}
                    onClick={() => setActiveTab(index)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                      activeTab === index
                        ? "bg-gray-700 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    )}
                  >
                    {snippet.label}
                  </button>
                ))}
              </div>

              {/* Code Content */}
              <div className="relative">
                <button
                  onClick={() =>
                    handleCopy(
                      codeSnippets[activeTab].code,
                      codeSnippets[activeTab].language
                    )
                  }
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {copied === codeSnippets[activeTab].language ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
                <pre className="p-6 text-sm text-gray-300 font-mono overflow-x-auto">
                  <code>{codeSnippets[activeTab].code}</code>
                </pre>
              </div>
            </div>

            {/* Endpoint URL Display */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <span className="text-sm text-gray-500">Your endpoint:</span>
                <code className="text-sm font-mono text-indigo-600">
                  {endpointUrl}
                </code>
                <button
                  onClick={() => handleCopy(endpointUrl, "url")}
                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {copied === "url" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={endpointUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
