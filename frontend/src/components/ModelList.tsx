import { useEffect, useState } from 'react';
import { Table, Button, Container, Title, Group, Paper } from '@mantine/core';
import { getModels, ModelRegistry } from '../api';
import { useNavigate } from 'react-router-dom';

export function ModelList() {
    const [models, setModels] = useState<ModelRegistry[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const data = await getModels();
            setModels(data);
        } catch (error) {
            console.error("Failed to load models", error);
        }
    };

    const rows = models.map((model) => (
        <tr key={model.id} onClick={() => navigate(`/models/${model.id}`)} style={{ cursor: 'pointer' }}>
            <td>{model.id}</td>
            <td>{model.name}</td>
            <td>{model.owner}</td>
            <td>{model.versions?.length || 0}</td>
            <td>{new Date(model.created_at).toLocaleDateString()}</td>
        </tr>
    ));

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="lg">
                <Title order={2}>AI Model Registry</Title>
                <Button onClick={() => navigate('/new')}>Register New Model</Button>
            </Group>
            <Paper shadow="xs" p="md" withBorder>
                <Table highlightOnHover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Owner</th>
                            <th>Versions</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </Table>
            </Paper>
        </Container>
    );
}
