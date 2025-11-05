# IoT BI Mapping Dashboard – React Frontend Documentation

## Overview
This project is a React-based dashboard for IoT Business Intelligence (BI) Mapping. It provides a user-friendly interface for managing dashboards, users, devices, and rules, with support for both demo (local state) and API-driven data.

## Project Structure
- `src/` – Main source code
  - `components/` – React components (Dashboard, DashboardManager, NMS, UserManagement, RulesEngine, etc.)
  - `data/` – Static data (for demo/testing)
  - `service/` – API configuration and helpers
  - `App.tsx` – Main app component and routing
  - `index.tsx` – Entry point
- `public/` – Static assets and `index.html`
- `build/` – Production build output

## Key Features
- **Dashboard Management**: Add, edit, and delete dashboards (demo mode uses local state; API mode uses backend).
- **User Management**: Fetches users from API for assignment to dashboards.
- **Device Management**: View and manage IoT devices.
- **Rules Engine**: Manage business rules for IoT data.
- **Authentication**: Simple login/logout with session stored in local state and localStorage.
- **Responsive UI**: Built with Tailwind CSS for modern, responsive design.
- **Electron Support**: Can run as a desktop app using Electron.


## Main Components & Functionality

- **DashboardManager.tsx**
   - Add, edit, and delete dashboards (CRUD)
   - Assign users to dashboards (users fetched from API)
   - Add, edit, and delete widgets (charts/maps) within dashboards
   - Demo mode: dashboards managed in React state (no API)
   - Edit and delete actions available in the dashboard list

- **Dashboard.tsx**
   - Displays dashboard data and widgets
   - Visualizes IoT data using charts and maps

- **UserManagement.tsx**
   - List all users
   - Add new users
   - Edit user details
   - Delete users
   - Assign roles and manage user status

- **DeviceManagement.tsx**
   - List all IoT devices
   - Add new devices
   - Edit device details
   - Delete devices
   - View device status and details

- **DeviceDetails.tsx**
   - Show detailed information for a selected device
   - Display device metrics and status

- **RulesEngine.tsx**
   - List all business rules
   - Add new rules
   - Edit and delete rules
   - Assign rules to devices or dashboards

- **NMS.tsx**
   - Network Management System view
   - Visualize network topology and device status

- **Modal.tsx**
   - Reusable modal dialog for forms, confirmations, and alerts
   - Used throughout the app for add/edit/delete confirmations

- **Login.tsx**
   - User login form
   - Handles authentication and session setup

- **ResetPassword.tsx**
   - Allows users to reset their password


## Routing
- Uses `react-router-dom` for navigation.
- Main routes:
  - `/` – Home/Dashboard
  - `/dashboards` – Dashboard management
  - `/nms` – NMS view
  - `/rules` – Rules engine
  - `/users` – User management
  - `/devices` – Device management
  - `/device/:deviceId` – Device details

## State Management
- Uses React's `useState` and `useEffect` for local state.
- Demo mode: Dashboards are managed in state; users are fetched from API.
- API mode: (Can be enabled by restoring API calls for dashboards.)

## Authentication & Logout
- User info is stored in state and localStorage.
- On logout, localStorage is cleared and user is redirected to login.

## Customization
- To switch between demo and API mode for dashboards, adjust the logic in `DashboardManager.tsx`.
- Update API endpoints in `service/Config.tsx` as needed.

## Running the Project
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```
3. For Electron desktop app:
   ```sh
   npm run electron
   ```

## Build for Production
```sh
npm run build
```

## Notes
- Ensure your backend API is running and accessible for user/device/rule management.
- For demo/testing, dashboards can be managed without an API.

---
For further details, see code comments and individual component files.
