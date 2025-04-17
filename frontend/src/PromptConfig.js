import React, { useState } from 'react';
import { Box, Typography, Button, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Slider, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * PromptConfig component lets users configure prompt topics and display durations.
 */
const defaultPrompts = [
  { label: 'Career', duration: 30 },
  { label: 'Family', duration: 30 },
  { label: 'Health', duration: 30 },
];

export default function PromptConfig({ prompts, setPrompts }) {
  const [newPrompt, setNewPrompt] = useState('');
  const [newDuration, setNewDuration] = useState(30);

  const handleAdd = () => {
    if (newPrompt.trim()) {
      setPrompts([...prompts, { label: newPrompt.trim(), duration: newDuration }]);
      setNewPrompt('');
      setNewDuration(30);
    }
  };

  const handleDelete = (idx) => {
    setPrompts(prompts.filter((_, i) => i !== idx));
  };

  const handleDurationChange = (idx, value) => {
    const updated = prompts.map((p, i) => (i === idx ? { ...p, duration: value } : p));
    setPrompts(updated);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Configure Prompts</Typography>
      <Typography variant="body1" gutterBottom>
        Add topics ("Career", "Family", "Health", etc.) and set how long each is displayed during a recording session.
      </Typography>
      <List>
        {prompts.map((prompt, idx) => (
          <ListItem key={idx}>
            <ListItemText
              primary={prompt.label}
              secondary={`Duration: ${prompt.duration} seconds`}
            />
            <Slider
              min={5}
              max={120}
              step={5}
              value={prompt.duration}
              onChange={(_, val) => handleDurationChange(idx, val)}
              sx={{ width: 120, mx: 2 }}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleDelete(idx)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Prompt topic"
          value={newPrompt}
          onChange={e => setNewPrompt(e.target.value)}
          size="small"
        />
        <Slider
          min={5}
          max={120}
          step={5}
          value={newDuration}
          onChange={(_, val) => setNewDuration(val)}
          sx={{ width: 120 }}
        />
        <Button variant="contained" onClick={handleAdd} disabled={!newPrompt.trim()}>
          Add
        </Button>
      </Box>
    </Box>
  );
}
