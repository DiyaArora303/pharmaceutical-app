# Pharmaceutical Drug Management System (PharmaDB)

A centralized clinical web application designed for healthcare professionals (Admins, Doctors, and Researchers) to manage drug registries, active ingredients, chemical compositions, and verify drug-drug interactions or contraindications.

---

## 🚀 How to Run the Application

Follow these steps to set up and run the project locally.

### Prerequisites
1. **Node.js** (v16.x or newer recommended)
2. **MySQL Database Server** (running locally on port 3306)

---

### 1. Database Setup
1. Log into your MySQL CLI or preferred client:
   ```bash
   mysql -u root -p
   ```
2. Create the database:
   ```sql
   CREATE DATABASE pharmaceutical_db;
   ```
3. Import the schema and seed data from the root directory:
   ```bash
   mysql -u root -p pharmaceutical_db < "DBMS .sql"
   ```

---

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file (if your local MySQL config differs from the default):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=Admin1234!
   DB_NAME=pharmaceutical_db
   PORT=5000
   ```
4. Start the backend development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

---

### 3. Frontend Setup
1. Open a new terminal session and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The application will open automatically in your browser at `http://localhost:3000`.

---

## 🔑 Demo Credentials

Sign in with any of the following pre-seeded clinical user roles:

| Role | Username | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Admin@123` | Full access (registry management, interactions, audit logs) |
| **Doctor** | `drsmith` | `Doctor@123` | View drug profiles, verify interactions, check contraindications |
| **Researcher** | `researcher1` | `Research@123` | Manage drug registry details, active ingredients, compounds |

---

## ✨ Features Added / Improved

We have upgraded the application with several clinical utility features:

1. **Detailed Drug Profile Drawer (Drugs Registry)**:
   - Clicking a drug row opens a sleek side-panel drawer.
   - Summarizes active/inactive ingredients, chemical formula, side effects by severity, and contraindications.
2. **Edit Drug Capabilities**:
   - Authorized roles (Admins and Researchers) can edit existing drug registry records through an interactive modal.
   - Built a corresponding `PUT /api/drugs/:id` endpoint on the backend.
3. **Interactive Clinical Safety Checker (Interactions Page)**:
   - Added a **Safety Checker** utility panel.
   - **Drug-Drug Interaction Checker**: Select any two drugs to instantly check if there is a known interaction risk.
   - **Patient Contraindication Checker**: Select a drug and a patient medical condition to verify if the drug is contraindicated.
4. **Enhanced Search Filters (Drugs Registry)**:
   - Filter drugs dynamically by **Therapeutic Class** or **Regulatory Status**.
5. **Delete Audit Logging**:
   - Added an `After_Drug_Delete` database trigger to write deleted drug operations to the `drug_audit_log` automatically.
