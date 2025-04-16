import React from 'react';
import { Box, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AdvancedFilters({ startDate, setStartDate, endDate, setEndDate, hasSummary, setHasSummary, hasTranscript, setHasTranscript }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          renderInput={(params) => <TextField {...params} size="small" />}
        />
        <FormControlLabel
          control={<Checkbox checked={hasSummary} onChange={e => setHasSummary(e.target.checked)} />}
          label="Has Summary"
        />
        <FormControlLabel
          control={<Checkbox checked={hasTranscript} onChange={e => setHasTranscript(e.target.checked)} />}
          label="Has Transcript"
        />
      </Box>
    </LocalizationProvider>
  );
}

export default AdvancedFilters;
