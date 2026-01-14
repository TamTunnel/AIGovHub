import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Paper,
  Table,
  Badge,
  Button,
  Group,
  Modal,
  TextInput,
  Select,
  Textarea,
  Switch,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { Policy, PolicyScope, PolicyConditionType } from "../types";
import { getApiUrl } from "../lib/apiUrl";

const SCOPE_COLORS: Record<string, string> = {
  global: "blue",
  organization: "grape",
  environment: "cyan",
};

const CONDITION_LABELS: Record<string, string> = {
  require_evaluation_before_approval: "Require Evaluation Before Approval",
  block_high_risk_without_approval: "Block High Risk Without Review",
  require_review_for_high_risk: "Require Review for High Risk",
};

export function PolicyList() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [opened, { open, close }] = useDisclosure(false);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    description: "",
    scope: "global" as PolicyScope,
    condition_type: "require_evaluation_before_approval" as PolicyConditionType,
    is_active: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl("/policies/"));
        const data = await res.json();
        if (!cancelled) setPolicies(data);
      } catch {
        console.error("Failed to load policies");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreatePolicy = async () => {
    try {
      const res = await fetch(getApiUrl("/policies/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPolicy),
      });
      if (res.ok) {
        const created = await res.json();
        setPolicies([created, ...policies]);
        close();
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
    }
  };

  const rows = policies.map((policy) => (
    <tr key={policy.id}>
      <td>{policy.name}</td>
      <td>
        <Badge color={SCOPE_COLORS[policy.scope] || "gray"}>
          {policy.scope}
        </Badge>
      </td>
      <td>
        {CONDITION_LABELS[policy.condition_type] || policy.condition_type}
      </td>
      <td>
        <Badge color={policy.is_active ? "green" : "gray"}>
          {policy.is_active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td>{new Date(policy.created_at).toLocaleDateString()}</td>
    </tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Governance Policies</Title>
        <Button onClick={open}>+ New Policy</Button>
      </Group>

      <Paper shadow="xs" p="md" withBorder>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Scope</th>
              <th>Condition</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>

      <Modal opened={opened} onClose={close} title="Create New Policy">
        <TextInput
          label="Policy Name"
          placeholder="e.g., Require Evaluation for Approval"
          value={newPolicy.name}
          onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
          mb="md"
        />
        <Textarea
          label="Description"
          placeholder="Describe what this policy enforces..."
          value={newPolicy.description}
          onChange={(e) =>
            setNewPolicy({ ...newPolicy, description: e.target.value })
          }
          mb="md"
        />
        <Select
          label="Scope"
          data={[
            { value: "global", label: "Global (All Models)" },
            { value: "organization", label: "Organization" },
            { value: "environment", label: "Environment" },
          ]}
          value={newPolicy.scope}
          onChange={(v) =>
            setNewPolicy({ ...newPolicy, scope: v as PolicyScope })
          }
          mb="md"
        />
        <Select
          label="Condition Type"
          data={[
            {
              value: "require_evaluation_before_approval",
              label: "Require Evaluation Before Approval",
            },
            {
              value: "block_high_risk_without_approval",
              label: "Block High Risk Without Review",
            },
            {
              value: "require_review_for_high_risk",
              label: "Require Review for High Risk",
            },
          ]}
          value={newPolicy.condition_type}
          onChange={(v) =>
            setNewPolicy({
              ...newPolicy,
              condition_type: v as PolicyConditionType,
            })
          }
          mb="md"
        />
        <Switch
          label="Active"
          checked={newPolicy.is_active}
          onChange={(e) =>
            setNewPolicy({ ...newPolicy, is_active: e.currentTarget.checked })
          }
          mb="md"
        />
        <Button fullWidth onClick={handleCreatePolicy}>
          Create Policy
        </Button>
      </Modal>
    </Container>
  );
}
