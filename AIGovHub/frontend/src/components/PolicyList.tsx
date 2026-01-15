import { useEffect, useState } from "react";
import type { Policy, PolicyScope, PolicyConditionType } from "../types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ShieldCheck,
  Plus,
  Globe,
  Building2,
  Package,
  CheckCircle,
  XCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const CONDITION_LABELS: Record<string, string> = {
  require_evaluation_before_approval: "Require Evaluation Before Approval",
  block_high_risk_without_approval: "Block High Risk Without Review",
  require_review_for_high_risk: "Require Review for High Risk",
};

export function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    scope: "global" as PolicyScope,
    condition_type: "require_evaluation_before_approval" as PolicyConditionType,
    is_active: true,
  });

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const res = await fetch(getApiUrl("/policies/"));
      const data = await res.json();
      setPolicies(data);
    } catch {
      console.error("Failed to load policies");
    }
  };

  const handleCreatePolicy = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/policies/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      });
      if (res.ok) {
        const created = await res.json();
        setPolicies([created, ...policies]);
        setOpen(false);
        setNewPolicy({
          name: "",
          description: "",
          scope: "global",
          condition_type: "require_evaluation_before_approval",
          is_active: true,
        });
      }
    } catch {
      console.error("Failed to create policy");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (policy: Policy) => {
    try {
      const res = await fetch(getApiUrl(`/policies/${policy.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !policy.is_active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPolicies(policies.map((p) => (p.id === policy.id ? updated : p)));
      }
    } catch {
      console.error("Failed to toggle policy");
    }
  };

  const handleDelete = async (policyId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this policy? This action cannot be undone.",
      )
    ) {
      return;
    }
    try {
      const res = await fetch(getApiUrl(`/policies/${policyId}`), {
        method: "DELETE",
      });
      if (res.ok) {
        setPolicies(policies.filter((p) => p.id !== policyId));
      }
    } catch {
      console.error("Failed to delete policy");
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case "global":
        return <Globe className="h-3 w-3" />;
      case "organization":
        return <Building2 className="h-3 w-3" />;
      case "environment":
        return <Package className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getScopeBadgeVariant = (scope: string) => {
    switch (scope) {
      case "global":
        return "default";
      case "organization":
        return "secondary";
      case "environment":
        return "outline";
      default:
        return "outline";
    }
  };

  const stats = {
    total: policies.length,
    active: policies.filter((p) => p.is_active).length,
    global: policies.filter((p) => p.scope === "global").length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Governance Policies
            </h1>
            <p className="text-muted-foreground mt-1">
              Define and manage compliance rules for AI model governance
            </p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
              <DialogDescription>
                Define a new governance policy to enforce compliance rules
                across your AI models.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="policyName">Policy Name *</Label>
                <Input
                  id="policyName"
                  placeholder="e.g., Require Evaluation for Approval"
                  value={newPolicy.name}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this policy enforces..."
                  value={newPolicy.description}
                  onChange={(e) =>
                    setNewPolicy({ ...newPolicy, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={newPolicy.scope}
                  onValueChange={(value) =>
                    setNewPolicy({ ...newPolicy, scope: value as PolicyScope })
                  }
                >
                  <SelectTrigger id="scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global (All Models)</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditionType">Condition Type</Label>
                <Select
                  value={newPolicy.condition_type}
                  onValueChange={(value) =>
                    setNewPolicy({
                      ...newPolicy,
                      condition_type: value as PolicyConditionType,
                    })
                  }
                >
                  <SelectTrigger id="conditionType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="require_evaluation_before_approval">
                      Require Evaluation Before Approval
                    </SelectItem>
                    <SelectItem value="block_high_risk_without_approval">
                      Block High Risk Without Review
                    </SelectItem>
                    <SelectItem value="require_review_for_high_risk">
                      Require Review for High Risk
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newPolicy.is_active}
                  onCheckedChange={(checked) =>
                    setNewPolicy({ ...newPolicy, is_active: checked })
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active (policy immediately enforced)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreatePolicy}
                disabled={loading || !newPolicy.name}
              >
                {loading ? "Creating..." : "Create Policy"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Policies
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Governance rules defined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Policies
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently enforced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Global Policies
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.global}</div>
            <p className="text-xs text-muted-foreground">Apply to all models</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Policies</CardTitle>
          <CardDescription>
            {policies.length === 0
              ? "No policies defined yet. Create your first policy to start enforcing governance rules."
              : `Manage and monitor ${policies.length} governance ${policies.length === 1 ? "policy" : "policies"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-12">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Policies Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first governance policy
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Policy
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.name}</TableCell>
                    <TableCell>
                      <Badge variant={getScopeBadgeVariant(policy.scope)}>
                        <span className="flex items-center gap-1">
                          {getScopeIcon(policy.scope)}
                          {policy.scope}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {CONDITION_LABELS[policy.condition_type] ||
                        policy.condition_type}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={policy.is_active ? "success" : "secondary"}
                      >
                        {policy.is_active ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(policy.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(policy)}
                          title={
                            policy.is_active
                              ? "Deactivate policy"
                              : "Activate policy"
                          }
                        >
                          {policy.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(policy.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete policy"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
