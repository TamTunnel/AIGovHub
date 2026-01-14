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
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  User,
  Info,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { getApiUrl } from "../lib/apiUrl";

interface AISuggestion {
  suggested_risk: string;
  reasoning: string;
  eu_criteria: string[];
  recommendations: string[];
}

export function ModelForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGetAISuggestion = async () => {
    if (!name || !description || !owner) {
      alert("Please fill in model name, owner, and description first");
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(getApiUrl("/ai/assess-risk"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_name: name,
          description: description,
          owner: owner,
        }),
      });

      if (response.status === 503) {
        setAiError("AI features are not enabled on the server");
        return;
      }

      if (!response.ok) {
        throw new Error("AI suggestion failed");
      }

      const data = await response.json();
      setAiSuggestion(data);
    } catch (error) {
      console.error("AI suggestion error:", error);
      setAiError(
        "Failed to get AI suggestion. Please try again or set risk manually.",
      );
    } finally {
      setAiLoading(false);
    }
  };

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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "destructive";
      case "limited":
        return "warning";
      case "minimal":
        return "secondary";
      case "unacceptable":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="p-8">
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
                Provide context about what this model does and how it will be
                used
              </p>
            </div>

            {/* AI Risk Suggestion */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">AI Risk Assessment</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetAISuggestion}
                  disabled={aiLoading || !name || !description || !owner}
                >
                  {aiLoading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Suggestion
                    </>
                  )}
                </Button>
              </div>

              {aiError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">{aiError}</p>
                </div>
              )}

              {aiSuggestion && (
                <div className="space-y-3 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Suggested Risk Level:
                    </span>
                    <Badge
                      variant={getRiskColor(aiSuggestion.suggested_risk) as any}
                    >
                      {aiSuggestion.suggested_risk.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Reasoning:</span>
                      <br />
                      {aiSuggestion.reasoning}
                    </p>

                    {aiSuggestion.eu_criteria.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">EU AI Act Criteria:</span>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                          {aiSuggestion.eu_criteria.map((criteria, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {aiSuggestion.recommendations.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Recommendations:</span>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                          {aiSuggestion.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    💡 This is an AI-generated suggestion. You can override risk
                    level on the model detail page after registration.
                  </p>
                </div>
              )}

              {!aiSuggestion && !aiError && (
                <p className="text-sm text-muted-foreground">
                  Fill in the form and click "Get AI Suggestion" to receive an
                  automated risk assessment based on EU AI Act guidelines.
                </p>
              )}
            </div>

            <div className="bg-muted p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Next steps:</span>{" "}
                After registration, this model will be assigned a "Draft"
                compliance status and "Unclassified" risk level. You can update
                these properties and add version details from the model detail
                page.
              </p>
            </div>

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
