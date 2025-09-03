import { Sx, SxFn } from './_types';

export const sxCommon = {
  // Layout
  row: { display: 'flex', alignItems: 'center', gap: 1 } as Sx,
  col: { display: 'flex', flexDirection: 'column', gap: 1 } as Sx,
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as Sx,
  paperSection: {
    p: 2,
    bgcolor: 'background.paper',
    borderRadius: 2,
    border: '1px solid',
    borderColor: 'divider',
  } as Sx,

  // Spacing helpers
  p2: { p: 2 } as Sx,
  p3: { p: 3 } as Sx,
  m1: { m: 1 } as Sx,

  // Buttons
  dangerBtn: { color: 'error.main' } as Sx,
  primaryBtn: { color: 'primary.main' } as Sx,

  // Dynamic example: pass a boolean
  selectableRow: (selected: boolean): Sx => ({
    bgcolor: selected ? 'action.selected' : 'background.paper',
    '&:hover': { bgcolor: selected ? 'action.selected' : 'action.hover' },
  }),
};