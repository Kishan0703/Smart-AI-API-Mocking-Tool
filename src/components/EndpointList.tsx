"use client";

import { useAppStore } from "@/lib/store";
import { MockEndpoint, HttpMethod } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Clock,
  Zap,
  AlertTriangle,
  Globe,
  Trash2,
  ChevronRight,
  Activity,
  Database,
} from "lucide-react";

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "bg-green-100 text-green-700 border-green-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PATCH: "bg-orange-100 text-orange-700 border-orange-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
};

export function EndpointList() {
  const { endpoints, currentEndpoint, setCurrentEndpoint, deleteEndpoint } = useAppStore();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this endpoint?")) {
      await fetch(`/api/endpoints/${id}`, { method: "DELETE" });
      deleteEndpoint(id);
    }
  };

  if (endpoints.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-12">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <Database className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No Endpoints Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Create your first mock API by describing what you need in the input above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Globe className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Your Mock Endpoints</h3>
            <p className="text-sm text-gray-500">{endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} created</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {endpoints.map((endpoint) => (
          <EndpointItem
            key={endpoint.id}
            endpoint={endpoint}
            isSelected={currentEndpoint?.id === endpoint.id}
            onSelect={() => setCurrentEndpoint(endpoint)}
            onDelete={(e) => handleDelete(endpoint.id, e)}
          />
        ))}
      </div>
    </div>
  );
}

interface EndpointItemProps {
  endpoint: MockEndpoint;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function EndpointItem({ endpoint, isSelected, onSelect, onDelete }: EndpointItemProps) {
  const hasChaosMode = endpoint.settings.latency > 0 || endpoint.settings.errorRate > 0;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "px-6 py-5 cursor-pointer transition-all duration-200",
        isSelected 
          ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500" 
          : "hover:bg-gray-50"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className={cn(
              "font-semibold truncate transition-colors",
              isSelected ? "text-indigo-700" : "text-gray-900"
            )}>
              {endpoint.name}
            </h4>
            {hasChaosMode && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                <Activity className="w-3 h-3" />
                Chaos
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 truncate mb-3 font-mono">
            /api/mock/{endpoint.slug}
          </p>

          {/* Method badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {endpoint.settings.supportedMethods.map((method) => (
              <span
                key={method}
                className={cn(
                  "px-2.5 py-1 text-xs font-semibold rounded-md border",
                  METHOD_COLORS[method]
                )}
              >
                {method}
              </span>
            ))}
          </div>

          {/* Chaos Mode indicators */}
          {hasChaosMode && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {endpoint.settings.latency > 0 && (
                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {endpoint.settings.latency}ms
                </span>
              )}
              {endpoint.settings.errorRate > 0 && (
                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  {endpoint.settings.errorRate}% errors
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onDelete}
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Delete endpoint"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight
            className={cn(
              "w-5 h-5 text-gray-400 transition-transform duration-200",
              isSelected && "rotate-90 text-indigo-500"
            )}
          />
        </div>
      </div>
    </div>
  );
}
