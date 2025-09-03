import { SxProps, Theme } from '@mui/material/styles';

export type Sx = SxProps<Theme>;
// Helper for dynamic variants (accept props then return an sx that accepts theme)
export type SxFn<P = void> = P extends void
  ? ((theme: Theme) => Record<string, any>)
  : ((props: P) => Sx);