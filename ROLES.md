# Virtual Lab LMS - Simplified Role System

## Overview
The Virtual Lab LMS uses a simplified 4-role system designed for educational institutions implementing virtual laboratory learning.

## Roles & Permissions

### 1. Administrator (`super_admin`)
**Purpose:** Platform-wide administrator with full access to all modules and users

**Email:** `admin@vlab.edu.kh`  
**Password:** `demo123`

**Permissions:**
- **Labs:** Create, read, update, delete all labs
- **Lab Resources:** Upload, replace, delete any resources
- **Sessions:** View all user sessions, delete sessions
- **Submissions:** Read all submissions, delete, annotate, override scores
- **Scores:** Read all scores, override, export
- **Curriculum:** Create, assign, edit, delete curricula
- **Users:** Manage all users across the platform
- **Settings:** Edit platform configuration

---

### 2. Teacher (`teacher`)
**Purpose:** Instructor responsible for managing labs, assessments, and student feedback

**Email:** `teacher@vlab.edu.kh`  
**Password:** `demo123`

**Permissions:**
- **Labs:** Create, read, update own labs
- **Lab Resources:** Upload resources to own labs
- **Sessions:** View sessions for own students
- **Submissions:** Read student submissions, annotate, override scores
- **Scores:** Read, override, export student scores
- **Curriculum:** Assign existing curricula, edit assigned curricula

---

### 3. Student (`student`)
**Purpose:** Learner who completes lab simulations and worksheets

**Email:** `student@vlab.edu.kh`  
**Password:** `demo123`

**Permissions:**
- **Labs:** Read assigned lab content
- **Lab Resources:** Launch simulations, view worksheets
- **Sessions:** Start, stop, view own sessions
- **Submissions:** Submit work, autosave progress
- **Scores:** Read own scores only

---

### 4. Parent (`parent`)
**Purpose:** Monitors a child's lab activity and performance

**Email:** `parent@vlab.edu.kh`  
**Password:** `demo123`

**Permissions:**
- **Labs:** Read metadata of child's assigned labs
- **Scores:** Read child's scores and progress reports
- **Sessions:** View child's activity summaries

## Role Hierarchy

```
Administrator (super_admin)
    └── Full platform control
    
Teacher (teacher)
    └── Class and lab management
    
Student (student)
    └── Lab participation
    
Parent (parent)
    └── Child monitoring
```

## Implementation Notes

1. **Role Assignment:** Users are assigned a single primary role stored in the `users.role` field
2. **Permission Checking:** Role-based permissions are checked at the API level for all operations
3. **Data Isolation:** Students and parents can only access their own or their child's data
4. **Simplified Access:** No complex multi-role assignments or permission matrices

## Demo Account Usage

All demo accounts use the password `demo123` and are pre-configured for immediate testing of the Virtual Lab LMS functionality.

### Testing Scenarios

- **Administrator:** Test full platform management, user creation, system configuration
- **Teacher:** Test lab creation, student assessment, curriculum management
- **Student:** Test lab interaction, submission workflows, progress tracking
- **Parent:** Test child monitoring, progress reports, communication features

This simplified role system ensures clear responsibilities while maintaining security and data privacy appropriate for educational environments.