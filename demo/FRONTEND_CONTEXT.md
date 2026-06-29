# 🏭 Asset Maintenance Management System — Backend API Context

## 🔧 Tech Stack
- **Framework:** Spring Boot (Java)
- **Database:** PostgreSQL (`asset_maintenance_db`, port `5432`)
- **Authentication:** JWT Bearer Token (24-hour expiry)
- **Base URL:** `http://localhost:8080`

---

## 🔐 Authentication Rules
- **Public routes:** `/api/auth/register`, `/api/auth/login` — no token needed
- **All other routes:** require `Authorization: Bearer <token>` header
- Token carries the user's **email** and **role** as claims

---

## 👤 User Roles & Permissions

| Role        | What They Can Do |
|-------------|-----------------|
| `USER`      | Report/create maintenance tasks |
| `TECHNICIAN`| Start tasks, mark complete, request materials |
| `MANAGER`   | Assign tasks, confirm/reject tasks, approve/reject material requests, view all |
| `ADMIN`     | Full access to everything |

---

## 📋 Enums Reference

### UserRole
```
USER, MANAGER, TECHNICIAN, ADMIN
```

### Department
```
IT, HR, FINANCE, OPERATIONS, SALES, MANAGEMENT, MAINTENANCE
```

### AssetType
```
CNC_MACHINE, PRESS_MACHINE, CONVEYOR, PUMP, COMPRESSOR,
GENERATOR, WELDING_MACHINE, PACKAGING_MACHINE, OTHER
```

### AssetStatus
```
ACTIVE, INACTIVE, UNDER_MAINTENANCE
```

### TaskStatus (lifecycle order)
```
REPORTED → ASSIGNED → IN_PROGRESS → MATERIAL_REQUESTED
→ MATERIAL_APPROVED | MATERIAL_REJECTED
→ COMPLETED_BY_TECHNICIAN → CONFIRMED_COMPLETED | COMPLETED
→ REOPENED | REJECTED
```

### TaskPriority
```
LOW, MEDIUM, HIGH, URGENT
```

### MaterialRequestStatus
```
PENDING, APPROVED, REJECTED
```

---

## 🔑 Auth Endpoints — `/api/auth`

### POST `/api/auth/register`
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "TECHNICIAN",
  "department": "MAINTENANCE"
}
```
**Response:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "TECHNICIAN",
  "department": "MAINTENANCE",
  "token": "<jwt_token>"
}
```

---

### POST `/api/auth/login`
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```
**Response:** Same as register ↑

---

## 👥 User Endpoints — `/api/users`

### GET `/api/users/{id}` — Any authenticated user
**Response:**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "TECHNICIAN",
  "department": "MAINTENANCE"
}
```
> ⚠️ `password` is NEVER returned in any response.

---

## 🏭 Asset Endpoints — `/api/asset`

| Method   | Endpoint                       | Roles     | Description          |
|----------|--------------------------------|-----------|----------------------|
| `POST`   | `/api/asset`                   | Any auth  | Create new asset     |
| `GET`    | `/api/asset`                   | Any auth  | Get all assets       |
| `GET`    | `/api/asset/{id}`              | Any auth  | Get asset by ID      |
| `GET`    | `/api/asset/type?type=PUMP`    | Any auth  | Filter assets by type|
| `PUT`    | `/api/asset/{id}`              | Any auth  | Update asset         |
| `DELETE` | `/api/asset/{id}`              | Any auth  | Delete asset         |

### Asset Object (Request & Response):
```json
{
  "assetId": 1,
  "assetCode": "AST-4523-XYZ",
  "assetName": "Main Pump",
  "assetType": "PUMP",
  "location": "Plant A - Floor 2",
  "manufacturer": "ABC Corp",
  "model": "X200",
  "serialNumber": "SN-001",
  "description": "Primary water pump for cooling system",
  "purchaseDate": "2023-01-15",
  "installationDate": "2023-02-01",
  "status": "ACTIVE"
}
```
> ✅ `assetCode` is **auto-generated** (format: `AST-XXXX-XXX`) — don't send it on create.
> ✅ `status` defaults to `ACTIVE` if not provided.

---

## 🔨 Maintenance Task Endpoints — `/api/tasks`

| Method | Endpoint                            | Roles                              | Description                  |
|--------|-------------------------------------|------------------------------------|------------------------------|
| `POST` | `/api/tasks?assetId={id}`           | USER, MANAGER, TECHNICIAN, ADMIN   | Create/report a task         |
| `GET`  | `/api/tasks`                        | MANAGER, ADMIN                     | Get all tasks                |
| `GET`  | `/api/tasks/{id}`                   | Any auth                           | Get task by ID               |
| `PUT`  | `/api/tasks/{id}/assign?technicianId={id}` | MANAGER                   | Assign task to technician    |
| `PUT`  | `/api/tasks/{id}/start`             | TECHNICIAN                         | Start working on task        |
| `PUT`  | `/api/tasks/{id}/complete`          | TECHNICIAN                         | Mark task as completed       |
| `PUT`  | `/api/tasks/{id}/confirm`           | MANAGER                            | Confirm task completion      |
| `PUT`  | `/api/tasks/{id}/reject`            | MANAGER                            | Reject task                  |

### Notes on Task Endpoints:
- `POST /api/tasks?assetId={id}` — `assetId` is a **query param**, task body in request body
- `PUT /api/tasks/{id}/assign?technicianId={id}` — `technicianId` is a **query param**, manager remarks as **raw string in request body** (optional)
- `PUT /api/tasks/{id}/complete` — technician remarks as **raw string in request body** (optional)
- `PUT /api/tasks/{id}/confirm` — manager remarks as **raw string in request body** (optional)
- `PUT /api/tasks/{id}/reject` — rejection reason as **raw string in request body** (optional)

### Task Request Body (for POST):
```json
{
  "title": "Fix pump leak",
  "description": "There is a water leak near the seal on Pump A",
  "priority": "HIGH"
}
```

### Task Full Response Object:
```json
{
  "taskId": 1,
  "taskCode": "TSK-3201-ABC",
  "title": "Fix pump leak",
  "description": "There is a water leak near the seal on Pump A",
  "priority": "HIGH",
  "status": "REPORTED",
  "asset": {
    "assetId": 1,
    "assetCode": "AST-4523-XYZ",
    "assetName": "Main Pump",
    "assetType": "PUMP",
    "location": "Plant A",
    "status": "ACTIVE"
  },
  "reportedBy": {
    "userId": 2,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "USER",
    "department": "OPERATIONS"
  },
  "assignedTo": null,
  "assignedBy": null,
  "managerRemarks": null,
  "technicianRemarks": null,
  "reportedAt": "2024-01-01T10:00:00",
  "assignedAt": null,
  "startedAt": null,
  "completedAt": null,
  "confirmedAt": null
}
```
> ✅ `taskCode` is **auto-generated** (format: `TSK-XXXX-XXX`)
> ✅ `status` defaults to `REPORTED` on creation

---

## 📜 Task History Endpoints — `/api/tasks`

| Method | Endpoint                    | Roles          | Description                      |
|--------|-----------------------------|----------------|----------------------------------|
| `GET`  | `/api/tasks/{taskId}/history` | MANAGER, ADMIN | Get full status change history |

### TaskHistory Response Object:
```json
{
  "historyId": 1,
  "task": { "taskId": 1, "taskCode": "TSK-3201-ABC", "title": "Fix pump leak" },
  "oldStatus": "REPORTED",
  "newStatus": "ASSIGNED",
  "changedBy": {
    "userId": 3,
    "name": "Bob Manager",
    "email": "bob@example.com",
    "role": "MANAGER"
  },
  "remarks": "Assigned to John technician",
  "changedAt": "2024-01-01T11:30:00"
}
```

---

## 📦 Material Request Endpoints — `/api/material-requests`

| Method | Endpoint                                  | Roles                          | Description                        |
|--------|-------------------------------------------|--------------------------------|------------------------------------|
| `POST` | `/api/material-requests?taskId={id}`      | TECHNICIAN                     | Create material request for a task |
| `GET`  | `/api/material-requests`                  | MANAGER, ADMIN                 | Get all material requests          |
| `GET`  | `/api/material-requests/{id}`             | MANAGER, ADMIN, TECHNICIAN     | Get request by ID                  |
| `GET`  | `/api/material-requests/task/{taskId}`    | MANAGER, ADMIN, TECHNICIAN     | Get requests by task               |
| `GET`  | `/api/material-requests/pending`          | MANAGER, ADMIN                 | Get all pending requests           |
| `GET`  | `/api/material-requests/my-requests`      | TECHNICIAN                     | Get own requests (logged-in tech)  |
| `PUT`  | `/api/material-requests/{id}/approve`     | MANAGER                        | Approve request (optional remarks) |
| `PUT`  | `/api/material-requests/{id}/reject`      | MANAGER                        | Reject request (optional remarks)  |

### Material Request Body (for POST):
```json
{
  "materialName": "Seal Kit",
  "quantity": 5,
  "reason": "Required for pump seal replacement"
}
```

### Material Request Full Response Object:
```json
{
  "mrId": 1,
  "task": {
    "taskId": 1,
    "taskCode": "TSK-3201-ABC",
    "title": "Fix pump leak"
  },
  "requestedBy": {
    "userId": 4,
    "name": "John Technician",
    "role": "TECHNICIAN"
  },
  "approvedBy": null,
  "materialName": "Seal Kit",
  "quantity": 5,
  "reason": "Required for pump seal replacement",
  "status": "PENDING",
  "managerRemarks": null,
  "requestedAt": "2024-01-02T09:00:00",
  "approvedAt": null
}
```
> ✅ `status` defaults to `PENDING` on creation

---

## 🔑 Frontend Auth Flow (Recommended)

```js
// 1. On Login — save to localStorage
localStorage.setItem('token', response.token);
localStorage.setItem('role', response.role);
localStorage.setItem('userId', response.userId);
localStorage.setItem('name', response.name);

// 2. Axios/Fetch — attach token to every request
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}

// 3. On 401 Unauthorized — token expired, redirect to login
if (response.status === 401) {
  localStorage.clear();
  navigate('/login');
}

// 4. On Logout — clear storage
localStorage.clear();
navigate('/login');
```

---

## 🖥️ Suggested Frontend Pages by Role

### All Roles (after login):
- `/login` — Login page
- `/dashboard` — Role-based dashboard

### USER:
- `/tasks/report` — Report a new maintenance task (select asset + fill details)
- `/tasks/my` — View tasks they reported

### TECHNICIAN:
- `/tasks/assigned` — View tasks assigned to them
- `/tasks/{id}` — Task detail (start, complete, request materials)
- `/material-requests/my` — View their own material requests

### MANAGER:
- `/tasks` — All tasks list
- `/tasks/{id}` — Task detail (assign, confirm, reject)
- `/material-requests` — All material requests (approve/reject)
- `/material-requests/pending` — Pending material requests

### ADMIN:
- All of the above +
- `/assets` — Manage all assets (CRUD)
- `/users` — View users

---

## ⚠️ Important Notes for Frontend

1. **No refresh token** — single JWT valid for **24 hours**. On expiry, redirect to login.
2. **Role-based UI** — use the `role` from login response to show/hide buttons and pages.
3. **assetCode & taskCode** — auto-generated by backend, never send them on create.
4. **Remarks fields** — sent as plain raw strings in request body (not JSON object).
5. **Dates** — backend uses `LocalDate` (YYYY-MM-DD) for asset dates and `LocalDateTime` (ISO 8601) for task timestamps.
6. **CORS** — if frontend runs on a different port, backend may need CORS configuration (ask backend dev).

