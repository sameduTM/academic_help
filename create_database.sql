-- Run these commands in your MySQL client (phpMyAdmin, MySQL Workbench, or command line)
CREATE DATABASE IF NOT EXISTS avril_writers;
USE avril_writers;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);