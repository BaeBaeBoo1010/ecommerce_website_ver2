"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Database, Zap, RefreshCw, ArrowRight, Upload } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: { id: string; name: string; slug: string };
}

interface BenchmarkResult {
  supabase: {
    time: number;
    count: number;
    dataSize: number;
    data: Product[];
  };
  redis: {
    time: number;
    count: number;
    cached: boolean;
    data: Product[];
  };
  speedup: number;
  message: string;
}

export default function BenchmarkPage() {
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [warming, setWarming] = useState(false);
  const [warmResult, setWarmResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function warmCache() {
    setWarming(true);
    setWarmResult(null);
    setError(null);

    try {
      const res = await fetch("/api/cache/refresh", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Warm cache failed");
        return;
      }

      setWarmResult(data.message);
    } catch (err) {
      setError("Network error");
    } finally {
      setWarming(false);
    }
  }

  async function runBenchmark() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/benchmark");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Benchmark failed");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🚀 Cache Benchmark
          </h1>
          <p className="text-slate-400">
            Compare Supabase vs Redis fetch performance
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            size="lg"
            onClick={warmCache}
            disabled={warming}
            variant="outline"
            className="gap-2 border-blue-500/50 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 px-6 py-6 text-lg font-semibold"
          >
            {warming ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Warming...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Warm Cache
              </>
            )}
          </Button>

          <Button
            size="lg"
            onClick={runBenchmark}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                Run Benchmark
              </>
            )}
          </Button>
        </div>

        {/* Warm Result */}
        {warmResult && (
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-center text-blue-300">
            {warmResult}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Speedup Banner */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6 text-center">
              <div className="text-6xl font-bold text-green-400 mb-2">
                {result.speedup}x
              </div>
              <div className="text-green-300 text-lg">{result.message}</div>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-3 gap-4 items-center">
              {/* Supabase Card */}
              <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-orange-400">
                    <Database className="h-5 w-5" />
                    Supabase
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {result.supabase.time} ms
                    </div>
                    <div className="text-slate-400 text-sm">Fetch time</div>
                  </div>
                  <div className="text-slate-300 text-sm space-y-1">
                    <div>{result.supabase.count} products</div>
                    <div>{formatBytes(result.supabase.dataSize)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-8 w-8 text-slate-500" />
              </div>

              {/* Redis Card */}
              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Zap className="h-5 w-5" />
                    Redis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      {result.redis.time} ms
                    </div>
                    <div className="text-slate-400 text-sm">Fetch time</div>
                  </div>
                  <div className="text-slate-300 text-sm space-y-1">
                    <div>{result.redis.count} products</div>
                    <div className={result.redis.cached ? "text-green-400" : "text-yellow-400"}>
                      {result.redis.cached ? "✓ Cache hit" : "○ Cache miss"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Comparison Bar */}
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-orange-400">Supabase</span>
                      <span className="text-slate-400">{result.supabase.time} ms</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400">Redis</span>
                      <span className="text-slate-400">{result.redis.time} ms</span>
                    </div>
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.max((result.redis.time / result.supabase.time) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raw Data Display */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Supabase Raw Data */}
              <Card className="bg-slate-800/50 border-orange-500/30 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-orange-400 text-sm">
                    <Database className="h-4 w-4" />
                    Supabase Raw Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap">
                    {JSON.stringify(result.supabase.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Redis Raw Data */}
              <Card className="bg-slate-800/50 border-green-500/30 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-400 text-sm">
                    <Zap className="h-4 w-4" />
                    Redis Raw Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-slate-300 bg-slate-900/50 p-3 rounded-lg overflow-auto max-h-80 whitespace-pre-wrap">
                    {JSON.stringify(result.redis.data, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
