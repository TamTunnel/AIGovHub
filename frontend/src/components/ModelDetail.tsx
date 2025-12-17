import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Card, Group, Badge, Button, Table, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ModelRegistry, ModelVersion, getModelVersions, createVersion, getAuditLogs, ComplianceLog } from '../api';

export function ModelDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [versions, setVersions] = useState<ModelVersion[]>([]);
    const [opened, { open, close }] = useDisclosure(false);

    // New Version State
    const [newVersionTag, setNewVersionTag] = useState('');
    const [s3Path, setS3Path] = useState('');

    useEffect(() => {
        if (id) loadVersions();
    }, [id]);

    const loadVersions = async () => {
        if (!id) return;
        try {
            const data = await getModelVersions(parseInt(id));
            setVersions(data);
        } catch (error) {
            console.error("Failed to load versions", error);
        }
    };

    const handleAddVersion = async () => {
        if (!id) return;
        try {
            await createVersion({
                model_id: parseInt(id),
                version_tag: newVersionTag,
                s3_path: s3Path
            });
            close();
            setNewVersionTag('');
            setS3Path('');
            loadVersions();
        } catch (error) {
            alert('Failed to add version');
        }
    };

    const versionRows = versions.map((v) => (
        <tr key={v.id}>
            <td><Badge>{v.version_tag}</Badge></td>
            <td>{v.s3_path || 'N/A'}</td>
            <td>{new Date(v.created_at).toLocaleString()}</td>
        </tr>
    ));

    return (
        <Container size="lg" py="xl">
            <Button variant="light" mb="md" onClick={() => navigate('/')}>← Back</Button>
            <Group justify="space-between" mb="lg">
                <Title>Model Details</Title>
                <Button onClick={open}>+ Add Version</Button>
            </Group>

            <Card withBorder shadow="sm" mb="xl">
                <Title order={4}>Versions History</Title>
                <Table mt="md">
                    <thead>
                        <tr>
                            <th>Version Tag</th>
                            <th>Artifact Location</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>{versionRows}</tbody>
                </Table>
            </Card>

            <Modal opened={opened} onClose={close} title="Add New Version">
                <TextInput
                    label="Version Tag"
                    placeholder="v1.0.0"
                    value={newVersionTag}
                    onChange={(e) => setNewVersionTag(e.currentTarget.value)}
                    mb="md"
                />
                <TextInput
                    label="Detail/Path"
                    placeholder="s3://bucket/path"
                    value={s3Path}
                    onChange={(e) => setS3Path(e.currentTarget.value)}
                    mb="md"
                />
                <Button fullWidth onClick={handleAddVersion}>Save Version</Button>
            </Modal>
        </Container>
    );
}
