import { useState } from 'react';
import { TextInput, Textarea, Button, Container, Title, Paper, Stack } from '@mantine/core';
import { createModel } from '../api';
import { useNavigate } from 'react-router-dom';

export function ModelForm() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [owner, setOwner] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async () => {
        try {
            await createModel({ name, owner, description });
            navigate('/');
        } catch (error) {
            alert('Failed to create model');
            console.error(error);
        }
    };

    return (
        <Container size="sm" py="xl">
            <Paper shadow="xs" p="xl" withBorder>
                <Title order={3} mb="lg">Register New Model</Title>
                <Stack>
                    <TextInput
                        label="Model Name"
                        placeholder="e.g. GPT-4 Fine-tune"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextInput
                        label="Owner"
                        placeholder="Team or Individual Name"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        required
                    />
                    <Textarea
                        label="Description"
                        placeholder="What does this model do?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Button onClick={handleSubmit} fullWidth mt="md">
                        Register Model
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}
