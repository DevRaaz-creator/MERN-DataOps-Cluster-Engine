# MERN Stack Lead Distribution Engine - Machine Test Submission

An enterprise-grade Task/Lead Distribution application built using the MERN stack. Features secure administrator authentication, dynamic agent cluster registry, local file stream validation parsing (.csv, .xlsx, .xls), and a live sequential workload remainder distribution algorithm.

## 🚀 Key Features Built
- **JWT Admin Security Matrix**: Secure login mechanics guarding cluster states.
- **Dynamic Cluster Balancing**: Automated remainder loops handling uneven file lengths sequentially.
- **Live Look Breakdown**: Real-time structural preview of spreadsheet records mapped directly to agent targets before/during final commit.
- **Asymmetric Data Lifecycle**: Individual agent workload subsets can be instantly extracted back into localized spreadsheets via native download triggers.

---

## 🛠️ Project Architecture Setup Instructions

### 1. Environmental Configurations
Create a `.env` file inside your `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lead_distribution_db
JWT_SECRET=super_secure_cryptographic_fallback_key