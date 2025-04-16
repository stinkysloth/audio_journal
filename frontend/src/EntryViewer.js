import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Button, Chip, TextField, InputAdornment, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AdvancedFilters from './AdvancedFilters';
import TagCloud from './TagCloud';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * EntryViewer: Displays a list of all journal entries and their details.
 */
function EntryViewer() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hasSummary, setHasSummary] = useState(false);
  const [hasTranscript, setHasTranscript] = useState(false);

  useEffect(() => {
    window.electronAPI.listEntries().then(setEntries);
  }, []);

  // Collect all unique tags for filter dropdown
  const allTags = Array.from(new Set(entries.flatMap(e => e.tags || [])));

  // Compute tag frequencies for tag cloud
  const tagCounts = entries.flatMap(e => e.tags || []).reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const tagCloudData = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count }));

  const handleTagCloudClick = (tag) => {
    if (!tagFilter.includes(tag)) setTagFilter([...tagFilter, tag]);
  };

  // Filter entries by search, tags, date, and toggles
  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      !search ||
      (entry.summary && entry.summary.toLowerCase().includes(search.toLowerCase())) ||
      (entry.transcriptSnippet && entry.transcriptSnippet.toLowerCase().includes(search.toLowerCase())) ||
      (entry.date && entry.date.includes(search));
    const matchesTags =
      tagFilter.length === 0 || (entry.tags && tagFilter.every(t => entry.tags.includes(t)));
    // Date filter
    let matchesDate = true;
    if (startDate && entry.date) {
      matchesDate = new Date(entry.date) >= new Date(startDate);
    }
    if (endDate && entry.date) {
      matchesDate = matchesDate && (new Date(entry.date) <= new Date(endDate));
    }
    // Toggles
    const matchesSummary = !hasSummary || (entry.summary && entry.summary.trim() !== '');
    const matchesTranscript = !hasTranscript || (entry.transcriptSnippet && entry.transcriptSnippet.trim() !== '');
    return matchesSearch && matchesTags && matchesDate && matchesSummary && matchesTranscript;
  });

  const handleSelect = (entry) => setSelected(entry);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>Journal Entries</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1 }}
        />
        <Autocomplete
          multiple
          size="small"
          options={allTags}
          value={tagFilter}
          onChange={(_, v) => setTagFilter(v)}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" placeholder="Filter by tag" />
          )}
          sx={{ minWidth: 200 }}
        />
        <AdvancedFilters
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
          hasSummary={hasSummary} setHasSummary={setHasSummary}
          hasTranscript={hasTranscript} setHasTranscript={setHasTranscript}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" color="secondary">Tag Cloud</Typography>
        <TagCloud tags={tagCloudData} onTagClick={handleTagCloudClick} />
      </Box>
      <Paper elevation={2} sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
        <List>
          {filteredEntries.length === 0 && <ListItem><ListItemText primary="No entries found." /></ListItem>}
          {filteredEntries.map((entry, idx) => (
            <React.Fragment key={entry.base}>
              <ListItem button selected={selected && selected.base === entry.base} onClick={() => handleSelect(entry)}>
                <ListItemText
                  primary={entry.date || entry.base}
                  secondary={
                    <>
                      <span>{entry.summary ? entry.summary.slice(0, 100) : entry.transcriptSnippet.slice(0, 100)}</span>
                      <br />
                      {entry.tags && entry.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>
      {selected && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" color="secondary" gutterBottom>{selected.date || selected.base}</Typography>
          <audio controls src={`file://${selected.audio}`} style={{ width: '100%' }} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Summary:</Typography>
          <Typography variant="body1">{selected.summary || 'No summary available.'}</Typography>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Transcript:</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected.transcriptSnippet}</Typography>
          <Box sx={{ mt: 2 }}>
            {selected.tags && selected.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default EntryViewer;
