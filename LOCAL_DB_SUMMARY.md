# Local Database Summary

## Overview
- **Database**: virtual_lab
- **Total Tables**: 65
- **Size**: 12 MB

## Table Categories
- **TaRL Base Tables**: 5 tables (tbl_*)
- **LMS Tables**: 22 tables (lms_*)
- **Student Tables**: 4 tables (student_*)
- **User/Auth Tables**: 6 tables (user*)
- **Simulation Tables**: 3 tables (simulation*)
- **Other Tables**: 25 tables

## Key Tables and Records

### Users & Authentication
- **users**: 8 records
  - Students: 2
  - Teachers: 2
  - Admin: 1
  - Parent: 2
  - Super Admin: 1
- **user_sessions**: 10 records

### Core TaRL Tables (Empty - Need Data)
- **tbl_child**: 0 records (students)
- **tbl_school_list**: 0 records
- **tbl_teacher_information**: 0 records
- **tbl_province**: 0 records

### Simulation System
- **simulations_catalog**: 1 record (pendulum lab)
- **simulation_exercises**: 4 records
- **student_simulation_progress**: 1 record
- **stem_simulations_catalog**: 9 records (duplicate table?)

### Activity Tracking
- **lms_activity_logs**: 70 records
- **student_achievements**: 5 records
- **student_assignments**: 3 records

## Critical Missing Data
1. No schools in tbl_school_list
2. No teachers in tbl_teacher_information
3. No students in tbl_child
4. No provinces in tbl_province

## Duplicate/Similar Tables
- Both `simulations_catalog` (1 record) and `stem_simulations_catalog` (9 records) exist
- Multiple achievement tables: `student_achievements`, `user_achievements`, `simulation_achievements`

## Migration Status
- **Total Migrations**: 20
- **First Migration**: 2025-07-04 22:02:02
- **Last Migration**: 2025-07-04 22:02:08

## Recommendations for Production
1. Run base data setup for provinces, schools, teachers
2. Consolidate simulation tables (choose between simulations_catalog and stem_simulations_catalog)
3. Ensure user accounts exist for login
4. Clean up duplicate table structures