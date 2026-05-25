create database jntua_labs;
use jntua_labs;
create table users(
id int primary key auto_increment,
full_name varchar(100),
email varchar(100) unique,
password varchar(255),
role enum('student','faculty','admin'),
department varchar(100),
created_at timestamp default current_timestamp);
create table questions(
id int primary key auto_increment,
faculty_id int,
title varchar(255),
description text,
language varchar(50),
difficulty enum('Easy','Medium','Hard'),
marks int,
foreign key(faculty_id) references users(id));
create table submissions(
id int primary key auto_increment,
student_id int,
question_id int,
code longText,
output text,
status enum('Pending','Accepted','Rejected'),
marks_obtained int,
foreign key(student_id) references users(id),
foreign key(question_id) references questions(id));
create table student_progress(
id int primary key auto_increment,
student_id int,
total_questions int default 0,
solved_questions int default 0,
total_marks int default 0,
foreign key(student_id) references users(id));
