import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getModels } from "../api";
import type { ModelRegistry } from "../types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw } from "lucide-react";

const RISK_COLORS = {
  unclassified: "gray",
  minimal: "success",
  limited: "secondary",
  high: "warning",
  unacceptable: "destructive",
} as const;

const STATUS_COLORS = {
  draft: "gray",
  under_review: "warning",
  approved: "success",
  retired: "secondary",
} as const;

export function ModelList() {
  const [models, setModels] = useState<ModelRegistry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await getModels();
      setModels(data);
    } catch (error) {
      console.error("Failed to load models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Model Registry
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your organization's AI models
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadModels} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button onClick={() => navigate("/new")}>
            <Plus />
            Register Model
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Models</CardTitle>
          <CardDescription>
            {models.length} model{models.length !== 1 ? "s" : ""} in the
            registry
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No models registered yet. Get started by registering your first
                model.
              </p>
              <Button onClick={() => navigate("/new")}>
                <Plus />
                Register First Model
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow
                    key={model.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/models/${model.id}`)}
                  >
                    <TableCell className="font-mono text-sm">
                      {model.id}
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>{model.owner}</TableCell>
                    <TableCell>
                      <Badge variant={RISK_COLORS[model.risk_level] || "gray"}>
                        {model.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATUS_COLORS[model.compliance_status] || "gray"
                        }
                      >
                        {model.compliance_status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(model.created_at).toLocaleDateString()}
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
