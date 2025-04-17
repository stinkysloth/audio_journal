import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import EarElectronsLogo from './EarElectronsLogo';

const navItems = [
  { label: 'Record', icon: <GraphicEqIcon /> },
  { label: 'Entries', icon: <LibraryMusicIcon /> },
  { label: 'Import', icon: <CloudUploadIcon /> },
  { label: 'Prompt', icon: <TipsAndUpdatesIcon /> },
];

export default function Sidebar({ selected, onSelect }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 220,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{ height: 64, display: 'flex', alignItems: 'center', px: 2, mb: 2 }}>
        <EarElectronsLogo size={36} />
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1, ml: 2 }}>
          Audio Journal
        </Typography>
      </Box>
      <List>
        {navItems.map((item, idx) => (
          <ListItem
            button
            key={item.label}
            selected={selected === idx}
            onClick={() => onSelect(idx)}
            sx={{
              borderRadius: 2,
              mb: 1,
              color: selected === idx ? 'primary.main' : 'text.secondary',
              bgcolor: selected === idx ? 'rgba(29,185,84,0.08)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(29,185,84,0.16)',
              },
            }}
          >
            <ListItemIcon sx={{ color: selected === idx ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
