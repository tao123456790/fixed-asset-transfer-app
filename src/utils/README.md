# Centralized Confirmation Service

This utility provides a centralized way to handle confirmation dialogs throughout the application using `material-ui-confirm`.

## Usage Examples

### 1. Import the service
```tsx
import useConfirmation from '../utils/confirmationService';

const MyComponent = () => {
  const { 
    confirmProcess, 
    confirmReject, 
    confirmDelete, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    askQuestion 
  } = useConfirmation();

  // Your component logic...
};
```

### 2. Process Confirmation
```tsx
const handleProcess = async () => {
  try {
    await confirmProcess("Are you sure you want to process this item?");
    // Process the item...
    await showSuccess("Item processed successfully!");
  } catch (error) {
    // User cancelled
  }
};
```

### 3. Reject with Comment
```tsx
const handleReject = async () => {
  try {
    const reason = await confirmReject("TF-2024-0001");
    // reason contains the user's rejection comment
    console.log("Rejection reason:", reason);
    await showSuccess("Item rejected successfully!");
  } catch (error) {
    // User cancelled or didn't provide reason
  }
};
```

### 4. Delete Confirmation
```tsx
const handleDelete = async () => {
  try {
    await confirmDelete("This will permanently delete the selected item.");
    // Delete the item...
    await showSuccess("Item deleted successfully!");
  } catch (error) {
    // User cancelled
  }
};
```

### 5. Simple Info/Warning Messages
```tsx
const showMessage = async () => {
  await showInfo("This is an information message.");
  await showWarning("This is a warning message.");
  await showError("This is an error message.");
};
```

### 6. Yes/No Question
```tsx
const askUser = async () => {
  try {
    await askQuestion("Do you want to continue with this action?");
    // User clicked Yes
  } catch (error) {
    // User clicked No
  }
};
```

### 7. Custom Confirmation
```tsx
import { CONFIRM_PRESETS } from '../utils/confirmationService';

const handleCustom = async () => {
  try {
    await confirm({
      title: "Custom Title",
      description: "Custom description",
      confirmationText: "Continue",
      cancellationText: "Cancel",
      confirmationButtonProps: {
        color: 'primary',
        variant: 'contained'
      }
    });
    // User confirmed
  } catch (error) {
    // User cancelled
  }
};
```

## Available Presets

- `success` - Success confirmation with green checkmark
- `error` - Error confirmation with red X
- `warning` - Warning confirmation with yellow warning icon
- `delete` - Delete confirmation with red button
- `process` - Process confirmation with green checkmark
- `reject` - Reject with required comment field
- `info` - Information dialog
- `question` - Yes/No question dialog

## Features

- ✅ Centralized configuration
- ✅ Pre-built common scenarios
- ✅ Required input validation for reject
- ✅ Consistent UI/UX across the app
- ✅ TypeScript support
- ✅ Promise-based API
- ✅ Customizable options