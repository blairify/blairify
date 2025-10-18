# User Management System - Admin Features

## Overview
Complete user management system for admins to create, read, update, and delete user accounts.

## Page Location
**Route:** `/admin/manage-users`

**Access:** Superadmin only (checked via `isSuperAdmin()`)

## Features

### 1. **User List View**
- ✅ Display all users in card format
- ✅ Show user details:
  - Display name
  - Email address
  - Role (user, admin, superadmin)
  - Active/Inactive status
  - Subscription plan (free, pro, enterprise)
  - Join date
- ✅ Real-time status badges
- ✅ Responsive grid layout

### 2. **Statistics Dashboard**
Four key metrics displayed at the top:
- **Total Users** - Count of all users
- **Active Users** - Currently active accounts
- **Admins** - Users with admin or superadmin role
- **Pro Users** - Users on pro subscription plan

### 3. **Search & Filtering**
- ✅ **Search Bar** - Search by email or display name
- ✅ **Role Filter** - Filter by:
  - All Roles
  - User
  - Admin
  - Superadmin
- ✅ **Status Filter** - Filter by:
  - All Status
  - Active
  - Inactive
- ✅ **Refresh Button** - Reload user list

### 4. **User Actions**

#### **Edit User**
- Click edit button to open edit dialog
- Modify user details:
  - Email
  - Display name
  - Photo URL
  - Role (user/admin/superadmin)
  - Active status
  - Subscription plan
  - Subscription status
- Save changes to Firestore

#### **Toggle Status**
- Quick activate/deactivate button
- Visual indicators:
  - Green checkmark for activate
  - Orange X for deactivate
- Instant status update

#### **Delete User**
- Trash icon button
- Confirmation dialog before deletion
- Permanently removes user from Firestore

### 5. **Add New User**
- "Add User" button in header
- Modal form with fields:
  - **Email** (required)
  - **Display Name** (required)
  - **Photo URL** (optional)
  - **Role** (required) - user/admin/superadmin
  - **Status** (required) - active/inactive
  - **Subscription Plan** (required) - free/pro/enterprise
  - **Subscription Status** (required) - active/cancelled/expired
- Auto-generates user preferences on creation
- Sets default subscription limits

## User Data Structure

```typescript
interface UserManagementData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: "user" | "admin" | "superadmin";
  isActive: boolean;
  subscription?: {
    plan: "free" | "pro" | "enterprise";
    status: "active" | "cancelled" | "expired";
  };
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
}
```

## Service Functions

### User Management Service (`/src/lib/user-management-service.ts`)

1. **`getAllUsers()`** - Fetch all users ordered by creation date
2. **`getUserById(uid)`** - Get single user by UID
3. **`createUser(userData)`** - Create new user with defaults
4. **`updateUser(uid, updates)`** - Update existing user
5. **`deleteUser(uid)`** - Delete user permanently
6. **`toggleUserStatus(uid, isActive)`** - Activate/deactivate user
7. **`updateUserRole(uid, role)`** - Change user role
8. **`searchUsers(searchTerm)`** - Search by email or name
9. **`getUsersByRole(role)`** - Filter users by role

## Default User Preferences

When creating a new user, the system automatically sets:

```typescript
preferences: {
  preferredDifficulty: "intermediate",
  preferredInterviewTypes: [],
  targetCompanies: [],
  notificationsEnabled: true,
  darkMode: false,
  language: "en",
  timezone: "UTC",
}
```

## Default Subscription Limits

For free plan users:

```typescript
subscription: {
  plan: "free",
  status: "active",
  features: [],
  limits: {
    sessionsPerMonth: 10,
    skillsTracking: 5,
    analyticsRetention: 30, // days
  },
}
```

## UI Components

### Layout
- Dashboard sidebar (collapsible)
- Dashboard navbar
- Main content area with scrolling

### Cards
- Stats cards (4 metrics)
- Filter card (search + dropdowns)
- User cards (individual user details)

### Dialogs
- Add user modal
- Edit user modal
- Delete confirmation (browser confirm)

### Badges
- Active/Inactive status
- Role badges
- Subscription plan badges

### Buttons
- Primary: Add User
- Outline: Edit, Toggle Status, Delete, Refresh
- Icon buttons with tooltips

## Security

### Access Control
- ✅ Page protected by `isSuperAdmin()` check
- ✅ Redirects non-admins to home page
- ✅ Checks on component mount and user change

### Firestore Rules Required
Update `firestore.rules` to allow admin operations:

```firestore
match /users/{userId} {
  // Admins can read all users
  allow read: if isAdmin();
  
  // Superadmins can create, update, delete users
  allow create, update, delete: if isSuperAdmin();
  
  // Users can read/update their own profile
  allow read, update: if request.auth.uid == userId;
}
```

## Error Handling

All operations include:
- Try-catch blocks
- Console error logging
- Toast notifications:
  - Success messages (green)
  - Error messages (red)
- Graceful fallbacks

## Loading States

- Initial page load: Shows loading message
- Empty state: "No users found" message
- Async operations: Disabled buttons during processing

## Responsive Design

- Mobile: Single column layout
- Tablet: 2-column stats grid
- Desktop: 4-column stats grid
- Filters stack vertically on mobile
- Cards adapt to screen size

## Future Enhancements

### Short Term
- Bulk actions (select multiple users)
- Export users to CSV
- User activity logs
- Last login timestamp display
- Email verification status

### Medium Term
- Advanced filters (subscription, join date range)
- User impersonation (for support)
- Bulk import from CSV
- User invitation system
- Password reset functionality

### Long Term
- User analytics dashboard
- Audit trail for admin actions
- Role-based permissions (granular)
- Custom user fields
- Integration with authentication providers

## Usage Example

### Creating a User
1. Click "Add User" button
2. Fill in required fields:
   - Email: `john@example.com`
   - Display Name: `John Doe`
   - Role: `user`
   - Status: `active`
   - Plan: `free`
3. Click "Create User"
4. User appears in list with default preferences

### Editing a User
1. Find user in list
2. Click edit icon
3. Modify fields (e.g., upgrade to `pro` plan)
4. Click "Update User"
5. Changes saved and list refreshes

### Deactivating a User
1. Find user in list
2. Click toggle status button (green checkmark)
3. User status changes to inactive
4. Badge updates to "Inactive"

### Searching Users
1. Type in search bar: `john`
2. List filters to matching users
3. Shows users with "john" in email or name

## Technical Stack

- **Frontend:** React, Next.js, TypeScript
- **UI:** shadcn/ui components
- **Database:** Firebase Firestore
- **State:** React hooks (useState, useEffect, useCallback)
- **Routing:** Next.js App Router
- **Notifications:** Sonner (toast)
- **Icons:** Lucide React

## Files Created

1. `/src/lib/user-management-service.ts` - Service layer
2. `/src/app/admin/manage-users/page.tsx` - UI page
3. `USER_MANAGEMENT_FEATURES.md` - Documentation

## Integration with Existing System

- ✅ Uses existing dashboard layout components
- ✅ Follows same auth pattern as practice library
- ✅ Consistent UI/UX with other admin pages
- ✅ Reuses existing UI components
- ✅ Same error handling patterns
- ✅ Compatible with existing Firestore structure
