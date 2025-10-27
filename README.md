assignment from school

URL to application:
http://127.0.0.1:8080/TaskList/

URL to demo:
http://127.0.0.1:8080/TaskList/demo/index.html

URL to the in-memory database of the application:
http://localhost:8080/TaskList/h2-console




A simple but complete task management web app built with vanilla JavaScript, AJAX (Fetch API), and a Spring Boot REST API backend.
Users can create, update, and delete tasks directly from the browser, with live updates handled asynchronously.

🧩 **Overview**

This project demonstrates full frontend–backend integration using AJAX.

Frontend: Custom Web Components (<task-view>, <task-list>, <task-box>) built with vanilla JavaScript and Shadow DOM for encapsulation.

Backend: Spring Boot REST API with TaskController and TaskRepository (JPA + CRUD).

Communication: JSON requests and responses via fetch() for all task operations.

✨ **Features**
__Frontend__

Displays list of tasks with live count updates

Create new tasks with a modal-style form (<task-box>)

Edit task status using a dropdown

Delete tasks instantly (AJAX DELETE)

Automatic UI updates after any action

Clean separation of logic via Web Components and templates

__Backend__

REST endpoints for full CRUD operations

Returns JSON for easy frontend integration

Uses JPA repository with pessimistic locks for safe concurrent access

Enum-based TaskStatuses for valid status values

Modular Response classes for structured API responses

🧠 **Tech Stack**
__Frontend__

HTML / CSS / Vanilla JavaScript

Fetch API (AJAX)

Custom Elements & Shadow DOM

__Backend__

Spring Boot (Java 21+)

Spring Data JPA

Hibernate

H2 / PostgreSQL (depending on setup)

Maven / Gradle

🧩 **Frontend Component Breakdown**
<task-view>

Root component

Fetches all statuses and tasks on load

Handles API calls for creation, updates, and deletions

Updates UI dynamically

<task-list>

Displays all tasks in a table

Contains status selector and delete buttons

Emits countChange event when task count changes

<task-box>

Hidden modal for creating new tasks

Shows when “New Task” button is clicked

Submits form data to the backend via AJAX POST

💡 **Notes**

This project was built as part of a school AJAX assignment to demonstrate understanding of:

Asynchronous client-server communication

RESTful API design with Spring Boot

Frontend modularization using Web Components

JSON-based data flow between client and backend

