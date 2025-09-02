# Fixed Asset Transfer

A Fixed Asset Transfer Management System based on LeaseMaster template.

## Features

- Asset Code Management
- Location Transfer Tracking
- Transfer Reason Documentation  
- Quick Action Buttons
- Responsive Design with Material-UI

## Components

### FixedAsset Component
Main component for handling fixed asset transfers, copied and modified from LeaseMaster's Login component.

**Location:** `src/components/FixedAsset/`

**Files:**
- `FixedAsset.tsx` - Main component logic
- `FixedAsset.css` - Component styling

## Form Fields

- **Asset Code**: Unique identifier for the asset
- **From Location**: Current location of the asset  
- **To Location**: Destination location for transfer
- **Transfer Reason**: Detailed reason for the transfer

## Quick Actions

- Search Assets
- View History  
- Generate Report

## Styling

Uses Material-UI components with custom CSS for:
- Background image from CP Axtra
- Green and blue color scheme for Fixed Asset branding
- Hover effects on action buttons
- Responsive layout

## Based on LeaseMaster Template

This project uses the Login component from LeaseMaster as a template, modified for Fixed Asset Transfer functionality.