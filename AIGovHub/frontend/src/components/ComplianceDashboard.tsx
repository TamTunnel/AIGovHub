import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "../types";
import { getApiUrl } from "../lib/apiUrl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RefreshCw, TrendingUp, Database, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const RISK_COLORS = {
  unclassified: "#9ca3af",
  minimal: "#22c55e",
  limited: "#3b82f6",
  high: "#f59e0b",
  unacceptable: "#ef4444",
};

const STATUS_COLORS = {
  draft: "#9ca3af",
  under_review: "#f59e0b",
  approved: "#22c55e",
  retired: "#6b7280",
};

export function ComplianceDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/dashboard/stats"));
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const riskData = stats.by_risk_level.map((item) => ({
    name: item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1),
    count: item.count,
    fill: RISK_COLORS[item.risk_level as keyof typeof RISK_COLORS] || "#9ca3af",
  }));

  const statusData = stats.by_compliance_status.map((item) => ({
    name: item.status
      .replace("_", " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
    count: item.count,
    fill: STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "#9ca3af",
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your AI model portfolio health and compliance status
          </p>
        </div>
        <Button variant="outline" onClick={loadStats} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_models}</div>
            <p className="text-xs text-muted-foreground">
              Registered in your organization
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Versions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_versions}</div>
            <p className="text-xs text-muted-foreground">Across all models</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_risk_level.find((r) => r.risk_level === "high")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require enhanced oversight
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Shield className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.by_compliance_status.find((s) => s.status === "approved")
                ?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for deployment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Models by Risk Level</CardTitle>
            <CardDescription>
              Distribution across EU AI Act risk classifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {stats.by_risk_level.map((item) => (
                <Badge
                  key={item.risk_level}
                  variant="outline"
                  className="gap-1"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        RISK_COLORS[
                          item.risk_level as keyof typeof RISK_COLORS
                        ],
                    }}
                  />
                  {item.risk_level}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Models by Compliance Status</CardTitle>
            <CardDescription>Governance workflow progression</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-sm" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {stats.by_compliance_status.map((item) => (
                <Badge key={item.status} variant="outline" className="gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[
                          item.status as keyof typeof STATUS_COLORS
                        ],
                    }}
                  />
                  {item.status.replace("_", " ")}: {item.count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
