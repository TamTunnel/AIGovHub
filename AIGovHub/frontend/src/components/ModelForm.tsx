import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createModel } from "../api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, User, Info, ArrowLeft, CheckCircle } from "lucide-react";

export function ModelForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !owner) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await createModel({ name, owner, description });
      navigate("/");
    } catch (error) {
      alert("Failed to create model");
      console.error(error);
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Register New Model
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a new AI model to your organization's governance registry
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Model Information</CardTitle>
          <CardDescription>
            Provide details about the model you're registering. Required fields
            are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Model Name */}
            <div className="space-y-2">
              <Label htmlFor="modelName" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Model Name *
              </Label>
              <Input
                id="modelName"
                placeholder="e.g., GPT-4 Fine-tune for Customer Support"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                A descriptive name that identifies this specific model
              </p>
            </div>

            {/* Owner */}
            <div className="space-y-2">
              <Label htmlFor="owner" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Owner *
              </Label>
              <Input
                id="owner"
                placeholder="Team name or individual responsible for this model"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                className="text-base"
              />
              <p className="text-sm text-muted-foreground">
                The team or individual accountable for this model's governance
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the model's purpose, capabilities, and intended use cases..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-base resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Optional: Provide context about what this model does and how it
                will be used
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-muted p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Next steps:</span>{" "}
                After registration, this model will be assigned a "Draft"
                compliance status and "Unclassified" risk level. You can update
                these properties and add version details from the model detail
                page.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading || !name || !owner}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Register Model
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
