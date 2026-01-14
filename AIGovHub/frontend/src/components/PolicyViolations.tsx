import { useEffect, useState } from "react";
import {
  Container,
  Title,
  Paper,
  Table,
  Badge,
  Text,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import type { PolicyViolation } from "../types";
import { getApiUrl } from "../lib/apiUrl";

export function PolicyViolations() {
  const [violations, setViolations] = useState<PolicyViolation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl("/policies/violations/"));
        const data = await res.json();
        if (!cancelled) setViolations(data);
      } catch {
        console.error("Failed to load violations");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = violations.map((v) => (
    <tr key={v.id}>
      <td>{v.id}</td>
      <td>
        {v.model_id ? (
          <Text
            c="blue"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/models/${v.model_id}`)}
          >
            Model #{v.model_id}
          </Text>
        ) : (
          "-"
        )}
      </td>
      <td>{v.action}</td>
      <td>
        <Badge color="red">Blocked</Badge>
      </td>
      <td>
        <Text size="xs" c="dimmed">
          {(v.details?.policy_name as string) || "Unknown Policy"}
        </Text>
      </td>
      <td>{new Date(v.created_at).toLocaleString()}</td>
    </tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <Stack gap={0}>
          <Title order={2}>Policy Violations</Title>
          <Text c="dimmed" size="sm">
            Actions that were blocked due to policy enforcement
          </Text>
        </Stack>
        <Button variant="light" onClick={() => navigate("/policies")}>
          View Policies
        </Button>
      </Group>

      <Paper shadow="xs" p="md" withBorder>
        {violations.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No policy violations recorded. All governance actions are compliant.
          </Text>
        ) : (
          <Table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Model</th>
                <th>Action</th>
                <th>Result</th>
                <th>Policy</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
