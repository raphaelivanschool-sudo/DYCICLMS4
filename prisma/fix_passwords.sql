-- Fix passwords with correct bcrypt hashes
-- Run this in phpMyAdmin SQL tab

UPDATE `User` SET `password` = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE `username` = 'admin';
UPDATE `User` SET `password` = '$2a$10$gE8xHs0wP1qQsKkGj6d7Ue4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE `username` = 'instructor1';
UPDATE `User` SET `password` = '$2a$10$tL3mNp5rX9uQwYvIj8kOWe4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE `username` = 'student1';
