-- PrintFlow Database Schema
-- Run this once to set up the database

CREATE DATABASE IF NOT EXISTS printflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE printflow;

-- Sales team
CREATE TABLE IF NOT EXISTS sales (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  color     VARCHAR(7)   NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO sales (name, color) VALUES
  ('สุรีวรรณ', '#3b82f6'),
  ('ยอตะวัน', '#10b981'),
  ('อภิรดี',   '#f97316'),
  ('จันทิมา',  '#8b5cf6');

-- Production user (Pond)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('production') DEFAULT 'production',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  job_no      VARCHAR(50)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  sales_id    INT          NOT NULL,
  due_date    DATE,
  paper       VARCHAR(100),
  colors      VARCHAR(50),
  coating     ENUM('ไม่เคลือบ','PVC ใส','PVC ด้าน','UV') DEFAULT 'ไม่เคลือบ',
  status      ENUM(
                'received',
                'artwork',
                'mockup',
                'proof_print',
                'wait_confirm',
                'revision',
                'plate'
              ) DEFAULT 'received',
  note        TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sales_id) REFERENCES sales(id)
);

-- Status history log
CREATE TABLE IF NOT EXISTS job_history (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  job_id     INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  note       TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
