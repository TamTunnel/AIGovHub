import { useEffect, useState } from 'react';
import { Table, Button, Container, Title, Group, Paper, Badge } from '@mantine/core';
import { getModels } from '../api';
import type { ModelRegistry } from '../types';
import { useNavigate } from 'react-router-dom';

const RISK_COLORS: Record<string, string> = {
    unclassified: 'gray',
    minimal: 'green',
    limited: 'blue',
    high: 'orange',
    unacceptable: 'red'
};

const STATUS_COLORS: Record<string, string> = {
    draft: 'gray',
    under_review: 'yellow',
    approved: 'green',
    retired: 'dark'
};

export function ModelList() {
    const [models, setModels] = useState<ModelRegistry[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getModels();
                if (!cancelled) setModels(data);
            } catch {
                console.error("Failed to load models");
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const rows = models.map((model) => (
        <tr key={model.id} onClick={() => navigate(`/models/${model.id}`)} style={{ cursor: 'pointer' }}>
            <td>{model.id}</td>
            <td>{model.name}</td>
            <td>{model.owner}</td>
            <td>
                <Badge color={RISK_COLORS[model.risk_level] || 'gray'}>
                    {model.risk_level}
                </Badge>
            </td>
            <td>
                <Badge color={STATUS_COLORS[model.compliance_status] || 'gray'}>
                    {model.compliance_status.replace('_', ' ')}
                </Badge>
            </td>
            <td>{new Date(model.created_at).toLocaleDateString()}</td>
        </tr>
    ));

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>AI Model Registry</Title>
                <Group>
                    <Button variant="light" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                    <Button variant="light" onClick={() => navigate('/policies')}>Policies</Button>
                    <Button onClick={() => navigate('/new')}>Register New Model</Button>
                </Group>
            </Group>
            <Paper shadow="xs" p="md" withBorder>
                <Table highlightOnHover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Risk Level</th>
                            <th>Status</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </Paper>
        </Container>
    );
}

