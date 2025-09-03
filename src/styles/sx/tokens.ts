import { Theme } from '@mui/material/styles';

export const surface = (theme: Theme) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
});

export const sectionTitle = (theme: Theme) => ({
  fontWeight: 600,
  lineHeight: 1.4,
});