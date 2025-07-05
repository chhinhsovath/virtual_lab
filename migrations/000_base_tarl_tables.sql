-- Base TaRL Tables
-- These are the existing tables that the TaRL system expects to be present
-- This migration creates them if they don't exist

-- Province table (existing TaRL table)
CREATE TABLE IF NOT EXISTS tbl_province (
    prvProvinceID SERIAL PRIMARY KEY,
    prvProvinceName VARCHAR(255) NOT NULL,
    prvProvinceNameKH VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- School list table (existing TaRL table)
CREATE TABLE IF NOT EXISTS tbl_school_list (
    sclAutoID SERIAL PRIMARY KEY,
    sclSchoolID VARCHAR(50) UNIQUE,
    sclSchoolName VARCHAR(255) NOT NULL,
    sclSchoolNameKH VARCHAR(255),
    sclProvince INTEGER REFERENCES tbl_province(prvProvinceID),
    sclDistrict VARCHAR(255),
    sclCluster VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher information table (existing TaRL table)
CREATE TABLE IF NOT EXISTS tbl_teacher_information (
    teiAutoID SERIAL PRIMARY KEY,
    teiTeacherID VARCHAR(50) UNIQUE,
    teiName VARCHAR(255) NOT NULL,
    teiNameKH VARCHAR(255),
    teiGender VARCHAR(10),
    teiPhone VARCHAR(20),
    teiEmail VARCHAR(255),
    teiSchoolID INTEGER REFERENCES tbl_school_list(sclAutoID),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Child table (existing TaRL table - students)
CREATE TABLE IF NOT EXISTS tbl_child (
    chiID SERIAL PRIMARY KEY,
    chiChildID VARCHAR(50) UNIQUE,
    chiName VARCHAR(255) NOT NULL,
    chiNameKH VARCHAR(255),
    chiSex VARCHAR(10),
    chiDOB DATE,
    chiGrade VARCHAR(20),
    chiSchoolID INTEGER REFERENCES tbl_school_list(sclAutoID),
    chiStatus VARCHAR(50) DEFAULT 'Active',
    -- Additional fields from migration 024
    photo_url TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Child information table (existing TaRL table - extended student info)
CREATE TABLE IF NOT EXISTS tbl_child_information (
    ID SERIAL PRIMARY KEY,
    chiID INTEGER REFERENCES tbl_child(chiID),
    phone_number VARCHAR(20),
    father_name VARCHAR(255),
    father_phone VARCHAR(20),
    mother_name VARCHAR(255),
    mother_phone VARCHAR(20),
    current_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_school_province ON tbl_school_list(sclProvince);
CREATE INDEX IF NOT EXISTS idx_teacher_school ON tbl_teacher_information(teiSchoolID);
CREATE INDEX IF NOT EXISTS idx_child_school ON tbl_child(chiSchoolID);
CREATE INDEX IF NOT EXISTS idx_child_info ON tbl_child_information(chiID);

-- Comments
COMMENT ON TABLE tbl_province IS 'Base TaRL table for provinces';
COMMENT ON TABLE tbl_school_list IS 'Base TaRL table for schools';
COMMENT ON TABLE tbl_teacher_information IS 'Base TaRL table for teachers';
COMMENT ON TABLE tbl_child IS 'Base TaRL table for students';
COMMENT ON TABLE tbl_child_information IS 'Base TaRL table for extended student information';