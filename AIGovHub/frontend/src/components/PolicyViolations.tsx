import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PolicyViolation } from "../types";
import { getApiUrl } from "../lib/apiUrl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, ShieldAlert, Clock, ExternalLink } from "lucide-react";

export function PolicyViolations() {
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      const res = await fetch(getApiUrl("/policies/violations/"));
      const data = await res.json();
      setViolations(data);
    } catch {
      console.error("Failed to load violations");
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Policy Violations
            </h1>
            <p className="text-muted-foreground mt-1">
              Actions that were blocked due to policy enforcement
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/policies")}>
          View Policies
        </Button>
      </div>

      {/* Alert Summary */}
      {violations.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive">
                  {violations.length} Compliance{" "}
                  {violations.length === 1 ? "Violation" : "Violations"}{" "}
                  Detected
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  These actions were automatically blocked by active governance
                  policies. Review each violation to ensure compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Violations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Violation History</CardTitle>
          <CardDescription>
            {violations.length === 0
              ? "No policy violations recorded. All governance actions are compliant."
              : `Track and monitor ${violations.length} blocked ${violations.length === 1 ? "action" : "actions"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-12">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                No policy violations have been recorded. Your team is
                maintaining full compliance with all governance policies.
              </p>
              <Button variant="outline" onClick={() => navigate("/policies")}>
                View Active Policies
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Policy</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-sm">{v.id}</TableCell>
                    <TableCell>
                      {v.model_id ? (
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary"
                          onClick={() => navigate(`/models/${v.model_id}`)}
                        >
                          Model #{v.model_id}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{v.action}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Blocked
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {(v.details?.policy_name as string) || "Unknown Policy"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(v.created_at).toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
