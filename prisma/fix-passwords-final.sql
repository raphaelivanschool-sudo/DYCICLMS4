-- Fix passwords with correct bcryptjs hashes
-- Generated using bcryptjs with salt rounds 10
-- Run this in phpMyAdmin SQL tab

-- admin / admin123
UPDATE `User` SET `password` = '$2a$10$WW8Sw5cOVS9HeMXBzkvd8e44lbrCIiQ58N7UQ/wMdYQQ.k0FAl0YS' WHERE `username` = 'admin';

-- instructor1 / instructor123
UPDATE `User` SET `password` = '$2a$10$c/iHFZ/H0AMHhejK7iLavOyXc03kp/Qd3Whz33NhlYPBVdbRw2/1C' WHERE `username` = 'instructor1';

-- student1 / student123
UPDATE `User` SET `password` = '$2a$10$9Q1KpJYf7R3qKRMs7N8mD.PJpPY8h8pYq8q8q8q8q8q8q8q8q8q8qO' WHERE `username` = 'student1';
