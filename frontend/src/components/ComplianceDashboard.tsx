import { useEffect, useState } from 'react';
import { Container, Title, Paper, Grid, Text, Badge, Group, Stack, Progress } from '@mantine/core';
import type { DashboardStats } from '../types';

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

export function ComplianceDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/dashboard/stats');
                const data = await res.json();
                if (!cancelled) setStats(data);
            } catch {
                console.error('Failed to load dashboard stats');
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (!stats) {
        return (
            <Container size="lg" py="xl">
                <Title>Loading dashboard...</Title>
            </Container>
        );
    }

    const maxRiskCount = Math.max(...stats.by_risk_level.map(r => r.count), 1);
    const maxStatusCount = Math.max(...stats.by_compliance_status.map(s => s.count), 1);

    return (
        <Container size="lg" py="xl">
            <Title order={2} mb="lg">Compliance Dashboard</Title>

            <Grid mb="xl">
                <Grid.Col span={6}>
                    <Paper shadow="xs" p="md" withBorder>
                        <Text size="sm" c="dimmed">Total Models</Text>
                        <Title order={1}>{stats.total_models}</Title>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={6}>
                    <Paper shadow="xs" p="md" withBorder>
                        <Text size="sm" c="dimmed">Total Versions</Text>
                        <Title order={1}>{stats.total_versions}</Title>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Grid>
                <Grid.Col span={6}>
                    <Paper shadow="xs" p="md" withBorder>
                        <Title order={4} mb="md">Models by Risk Level</Title>
                        <Stack gap="sm">
                            {stats.by_risk_level.map(item => (
                                <div key={item.risk_level}>
                                    <Group justify="space-between" mb={4}>
                                        <Badge color={RISK_COLORS[item.risk_level] || 'gray'}>
                                            {item.risk_level.toUpperCase()}
                                        </Badge>
                                        <Text size="sm">{item.count}</Text>
                                    </Group>
                                    <Progress
                                        value={(item.count / maxRiskCount) * 100}
                                        color={RISK_COLORS[item.risk_level] || 'gray'}
                                        size="sm"
                                    />
                                </div>
                            ))}
                        </Stack>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={6}>
                    <Paper shadow="xs" p="md" withBorder>
                        <Title order={4} mb="md">Models by Compliance Status</Title>
                        <Stack gap="sm">
                            {stats.by_compliance_status.map(item => (
                                <div key={item.status}>
                                    <Group justify="space-between" mb={4}>
                                        <Badge color={STATUS_COLORS[item.status] || 'gray'}>
                                            {item.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <Text size="sm">{item.count}</Text>
                                    </Group>
                                    <Progress
                                        value={(item.count / maxStatusCount) * 100}
                                        color={STATUS_COLORS[item.status] || 'gray'}
                                        size="sm"
                                    />
                                </div>
                            ))}
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
