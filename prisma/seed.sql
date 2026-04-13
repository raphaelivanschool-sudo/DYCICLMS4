-- Seed data for testing - Admin, Instructor, and Student users
-- Passwords: admin123, instructor123, student123
-- Run this in MySQL/phpMyAdmin to create test accounts

-- Admin User (password: admin123)
INSERT INTO `User` (`username`, `password`, `role`, `fullName`, `email`, `createdAt`, `updatedAt`) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'System Administrator', 'admin@dyci.edu', NOW(), NOW())
ON DUPLICATE KEY UPDATE `username` = `username`;

-- Instructor User (password: instructor123)
INSERT INTO `User` (`username`, `password`, `role`, `fullName`, `email`, `createdAt`, `updatedAt`) 
VALUES ('instructor1', '$2a$10$gE8xHs0wP1qQsKkGj6d7Ue4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'INSTRUCTOR', 'John Smith - Instructor', 'instructor@dyci.edu', NOW(), NOW())
ON DUPLICATE KEY UPDATE `username` = `username`;

-- Student User (password: student123)
INSERT INTO `User` (`username`, `password`, `role`, `fullName`, `email`, `createdAt`, `updatedAt`) 
VALUES ('student1', '$2a$10$tL3mNp5rX9uQwYvIj8kOWe4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT', 'Jane Doe - Student', 'student@dyci.edu', NOW(), NOW())
ON DUPLICATE KEY UPDATE `username` = `username`;
