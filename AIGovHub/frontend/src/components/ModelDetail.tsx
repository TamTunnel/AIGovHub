import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getModelVersions, createVersion } from "../api";
import type { ModelVersion } from "../types";
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
import {
  ArrowLeft,
  Plus,
  GitBranch,
  Package,
  Calendar,
  FolderTree,
} from "lucide-react";

export function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Version State
  const [newVersionTag, setNewVersionTag] = useState("");
  const [s3Path, setS3Path] = useState("");

  const fetchVersions = async () => {
    if (!id) return;
    try {
      const data = await getModelVersions(parseInt(id));
      setVersions(data);
    } catch {
      console.error("Failed to load versions");
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [id]);

  const handleAddVersion = async () => {
    if (!id || !newVersionTag) return;
    setLoading(true);
    try {
      await createVersion({
        model_id: parseInt(id),
        version_tag: newVersionTag,
        s3_path: s3Path,
      });
      setOpen(false);
      setNewVersionTag("");
      setS3Path("");
      fetchVersions();
    } catch {
      alert("Failed to add version");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Models
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Model Details
              </h1>
              <p className="text-muted-foreground mt-1">
                View and manage versions for model #{id}
              </p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Version</DialogTitle>
                <DialogDescription>
                  Register a new version of this model with its artifact
                  location
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="versionTag"
                    className="flex items-center gap-2"
                  >
                    <GitBranch className="h-4 w-4" />
                    Version Tag *
                  </Label>
                  <Input
                    id="versionTag"
                    placeholder="v1.0.0 or 2024-01-14"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use semantic versioning (e.g., v1.0.0) or date-based tags
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s3Path" className="flex items-center gap-2">
                    <FolderTree className="h-4 w-4" />
                    Artifact Location
                  </Label>
                  <Input
                    id="s3Path"
                    placeholder="s3://bucket/models/model-v1.0.0"
                    value={s3Path}
                    onChange={(e) => setS3Path(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional: S3 path, Docker registry URL, or file location
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddVersion}
                  disabled={loading || !newVersionTag}
                >
                  {loading ? "Saving..." : "Save Version"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Version Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Versions
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
            <p className="text-xs text-muted-foreground">Registered versions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Version
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {versions[0]?.version_tag || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most recent release</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {versions[versions.length - 1]
                ? new Date(
                    versions[versions.length - 1].created_at,
                  ).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Initial version date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Versions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Versions History</CardTitle>
          <CardDescription>
            {versions.length === 0
              ? "No versions registered yet. Add your first version to start tracking model iterations."
              : `Track and manage ${versions.length} registered ${versions.length === 1 ? "version" : "versions"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Versions Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking this model's evolution by adding version
                information
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Version
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version Tag</TableHead>
                  <TableHead>Artifact Location</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        <GitBranch className="h-3 w-3 mr-1" />
                        {v.version_tag}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {v.s3_path || (
                        <span className="text-muted-foreground/50">
                          Not specified
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(v.created_at).toLocaleString()}
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
