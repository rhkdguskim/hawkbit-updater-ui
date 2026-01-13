# Implementation Plan - Refactor Target Management Interaction

## Problem Class
User Interaction Refactor

## User Objective
Change the interaction patterns in the Target List:
1. "Detail" action (Eye icon) should navigate directly to the full Target Detail page instead of opening a Drawer.
2. Clicking the Target Name should open a Popover with quick details (Quick View) instead of navigating.

## Proposed Changes

### 1. New Component: `TargetQuickView`
Create a lightweight component to be displayed inside the Popover when the target name is clicked.
- **Location**: `src/features/targets/components/TargetQuickView.tsx`
- **Content**:
    - Name / Controller ID
    - Description
    - Status (Online/Offline/Update Status)
    - IP Address
    - Last Seen
    - Installed Distribution Set (brief)
    - Formatting: Use `Descriptions` or a clean flex layout.

### 2. Update `targetListConfig.tsx`
Modify the column definitions.
- **Name Column**:
    - Wrap the name text in an Ant Design `Popover`.
    - Set `trigger="click"`.
    - Content: `<TargetQuickView target={record} />`.
    - Styling: Ensure cursor is a pointer.
- **Action Column**:
    - Retain `onView` callback usage for the Eye icon.

### 3. Update `TargetList.tsx`
Modify the interaction handlers passed to `targetListConfig`.
- **Handler Update**:
    - Change the `onView` prop in `getTargetColumns` to use a navigation handler instead of `handleViewInDrawer`.
    - Use `useNavigate` to go to `/targets/${record.controllerId}`.
- **Double Click (Optional but recommended)**:
    - Update `onDoubleClick` row handler to also navigate to the detail page for consistency.

## Verification Plan

### Automated Tests
- None specified (UI interaction change).

### Manual Verification
1. **Name Click**:
    - Go to Target List.
    - Click on a Target Name.
    - Verify a Popover appears with target details.
    - Verify it does *not* navigate to the detail page.
2. **Detail Action**:
    - Click the "Eye" icon in the Actions column.
    - Verify the browser navigates to `/targets/:controllerId`.
    - Verify the full Target Detail page is rendered.
