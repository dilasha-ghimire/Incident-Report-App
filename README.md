# Incident Report App (MERN Stack)

This repository contains the **Incident Report App**, a robust MERN-stack application designed to report, track, and manage incidents efficiently. It supports both user and admin roles for submitting reports, updating statuses, and managing resolution processes.

---

## 📌 Key Features

### 👷 User Portal:

- Submit incident reports with descriptions and evidence attachments.
- View status of previously submitted reports.
- Edit unresolved reports.

### 🛠 Admin Dashboard:

- View all submitted reports in tabular or filtered format.
- Update report status (e.g., "Pending", "In Progress", "Resolved", "Rejected").
- View user information in tabular format.

---

## 🛠 Tech Stack

| Technology     | Purpose                                    |
| -------------- | ------------------------------------------ |
| **MongoDB**    | NoSQL database for reports and users       |
| **Express.js** | RESTful APIs for backend operations        |
| **React.js**   | User interface                             |
| **Node.js**    | Backend runtime                            |
| **JWT**        | Role-based authentication & access control |
| **Multer**     | File uploads (e.g., images/documents)      |
| **Bcrypt**     | Secure password encryption                 |
| **Dotenv**     | Manage environment variables               |

---

## 🔒 Security Features

### 🔐 User Registration & Authentication

- Email format validation
- Multifactor authentication (MFA)
- Frontend + backend input validation

### 🔒 Password Security

- Enforced password length and complexity
- Password reusability prevention
- Real-time password strength meter

### 🧪 Security Features

- Password hashing with Bcrypt
- Data encryption in transit
- Brute force attack protection (rate limiting)

### 👮‍♂️ Role-Based Access Control

- Distinct user roles: `user`, `admin`
- Route guards for protected endpoints

### 📦 Session Management

- Token-based session handling (JWT)
- Secure refresh and access token flow

### 📝 Activity Logging

- Tracks login attempts and report actions (extendable to audit trail)

### 🌐 Web Security

- HTTPS enforcement for secure communication
- Input sanitization to prevent XSS/SQL injection
- CSRF protection with tokens
- CORS policy management
- Clickjacking protection via Helmet middleware
- NoSQL injection prevention via strict query handling

---

## 🚀 Getting Started

### 1️⃣ Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (Atlas or local)
- Git

---

### 2️⃣ Backend Setup (Express.js + MongoDB)

```bash
git clone https://github.com/dilasha-ghimire/Incident-Report-App.git
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start the server
npm run dev
```

Runs on:  
🔗 http://localhost:5000

---

### 3️⃣ Frontend Setup (React.js)

```bash
cd ../client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Runs on:  
🌐 http://localhost:5173

---
