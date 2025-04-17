import React, { useEffect, useState, memo } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, Paper, Button, Chip, TextField, InputAdornment, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { FixedSizeList } from 'react-window';
import AdvancedFilters from './AdvancedFilters';
import TagCloud from './TagCloud';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// --- Inline ErrorBoundary for diagnosis ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('EntryViewer render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return <Box sx={{ p: 4 }}><Typography color="error">Render error: {this.state.error.message || String(this.state.error)}</Typography></Box>;
    }
    return this.props.children;
  }
}

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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const result = await window.electronAPI.listEntries();
        console.log('DEBUG: listEntries result:', result);
        if (!Array.isArray(result)) {
          setError('Failed to load entries: Malformed or missing data.');
          setEntries([]);
          return;
        }
        setEntries(result);
        setError(null);
      } catch (err) {
        setError('Could not load entries.');
        setEntries([]);
        console.error('IPC call to listEntries failed:', err);
      }
    };
    fetchEntries();
  }, []);

  // Defensive: always arrays
  const allTags = Array.from(new Set(entries.flatMap(e => (e.tags || []))));
  const tagCounts = entries.flatMap(e => (e.tags || [])).reduce((acc, tag) => {
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
      tagFilter.length === 0 || (entry.tags && tagFilter.every(t => (entry.tags || []).includes(t)));
    let matchesDate = true;
    if (startDate && entry.date) {
      matchesDate = new Date(entry.date) >= new Date(startDate);
    }
    if (endDate && entry.date) {
      matchesDate = matchesDate && (new Date(entry.date) <= new Date(endDate));
    }
    const matchesSummary = !hasSummary || (entry.summary && entry.summary.trim() !== '');
    const matchesTranscript = !hasTranscript || (entry.transcriptSnippet && entry.transcriptSnippet.trim() !== '');
    return matchesSearch && matchesTags && matchesDate && matchesSummary && matchesTranscript;
  });

  const handleSelect = (entry) => setSelected(entry);

  // Log props to TagCloud and AdvancedFilters for diagnosis
  useEffect(() => {
    console.log('DEBUG: TagCloudData', tagCloudData);
    console.log('DEBUG: AdvancedFilters', { startDate, endDate, hasSummary, hasTranscript });
  }, [tagCloudData, startDate, endDate, hasSummary, hasTranscript]);

  // --- Row component for react-window ---
  const Row = memo(({ index, style, data }) => {
    const { entries, selected, handleSelect } = data;
    const entry = entries[index];

    if (!entry) return null; // Handle edge case where entry might be undefined

    return (
      <ListItem
        style={style}
        button
        key={entry.base || index}
        selected={selected && selected.base === entry.base}
        onClick={() => handleSelect(entry)}
        divider
      >
        <ListItemText
          primary={entry.date || entry.base || `Entry ${index + 1}`}
          secondary={
            <>
              <Typography component="span" variant="body2" color="text.secondary" noWrap>
                {(entry.summary && typeof entry.summary === 'string')
                  ? entry.summary.slice(0, 100)
                  : ((entry.transcriptSnippet && typeof entry.transcriptSnippet === 'string') ? entry.transcriptSnippet.slice(0, 100) : '')}
              </Typography>
              <br />
              {(entry.tags || []).map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mt: 0.5 }} />)}
            </>
          }
        />
      </ListItem>
    );
  });

  return (
    <ErrorBoundary>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>Journal Entries</Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}
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
          {/* Defensive: fallback rendering for AdvancedFilters */}
          {AdvancedFilters ? (
            <AdvancedFilters
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              hasSummary={hasSummary} setHasSummary={setHasSummary}
              hasTranscript={hasTranscript} setHasTranscript={setHasTranscript}
            />
          ) : (
            <Typography color="error">AdvancedFilters missing</Typography>
          )}
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="secondary">Tag Cloud</Typography>
          {/* Defensive: fallback rendering for TagCloud */}
          {TagCloud ? (
            <TagCloud tags={tagCloudData} onTagClick={handleTagCloudClick} />
          ) : (
            <Typography color="error">TagCloud missing</Typography>
          )}
        </Box>
        <Paper elevation={2} sx={{ height: 400, width: '100%', overflow: 'hidden', mb: 2 }}>
          {filteredEntries.length === 0 ? (
            <ListItem><ListItemText primary="No entries found." /></ListItem>
          ) : (
            <FixedSizeList
              height={400} // Match Paper height
              itemCount={filteredEntries.length}
              itemSize={90} // Estimate row height (adjust as needed)
              width={'100%'}
              itemData={{
                entries: filteredEntries,
                selected: selected,
                handleSelect: handleSelect
              }}
            >
              {Row}
            </FixedSizeList>
          )}
        </Paper>
        {selected && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" color="secondary" gutterBottom>{selected.date || selected.base || 'Entry'}</Typography>
            {selected.audio && <audio controls src={`file://${selected.audio}`} style={{ width: '100%' }} />}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Summary:</Typography>
            <Typography variant="body1">{selected.summary || 'No summary available.'}</Typography>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Transcript:</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected.transcriptSnippet || 'No transcript available.'}</Typography>
            <Box sx={{ mt: 2 }}>
              {(selected.tags || []).map(tag => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}
            </Box>
          </Paper>
        )}
      </Box>
    </ErrorBoundary>
  );
}

export default EntryViewer;
