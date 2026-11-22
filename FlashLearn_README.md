# FlashLearn – Flashcard Study App

FlashLearn is a small flashcard application built with HTML, CSS, JavaScript, jQuery, PHP, and MySQL. Users can register, log in, create question-and-answer flashcards, review them, shuffle the review order, and delete cards.

## Features

- **Register and log in**
  - Username must contain at least 3 alphanumeric characters.
  - Password must be at least 8 characters and include a letter, a number, and a special character.
  - Passwords are stored with PHP `password_hash()` and verified with `password_verify()`.
- **Create flashcards** from a question and an answer.
- **Review flashcards**
  - Show all cards.
  - Flip a card to reveal its answer.
  - Navigate to the previous and next cards.
  - Delete the current card.
- **Random review** by shuffling the cards loaded for the current user.
- **Dark mode** toggle.
- **AJAX requests** between the browser and the PHP backend.
- **JSON responses** for the main operations and an XML response for the user-info example.
- **Responsive styling** with a mobile breakpoint.

## Technology stack

- HTML5
- CSS3
- JavaScript
- jQuery 3.6.0 (loaded from the jQuery CDN)
- PHP
- MySQL / MySQLi

## Project structure

```text
flash-cards/
├── index.html       # Page structure and application sections
├── project.css      # Layout, colors, themes, animations, responsive styles
├── project.js       # UI behavior, validation, review controls, AJAX calls
├── server.php       # PHP backend and MySQL operations
└── README.md
```

## Requirements

- PHP with the **MySQLi** extension
- MySQL server
- A local or hosted PHP web server (for example, Apache through XAMPP)
- A modern web browser
- Internet access to load jQuery 3.6.0 from its CDN

## Database setup

The backend expects a database named `flashlearn_db`. The connection settings currently defined near the top of `server.php` are:

- Host: `localhost`
- Username: `root`
- Password: empty
- Database: `flashlearn_db`

Create the database and tables with:

```sql
CREATE DATABASE flashlearn_db;
USE flashlearn_db;

CREATE TABLE users (
    username VARCHAR(100) PRIMARY KEY,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    INDEX idx_flashcards_username (username)
);
```

These columns match the SQL statements used in `server.php`.

## Run locally

1. Install a local PHP/MySQL environment such as XAMPP.
2. Start Apache and MySQL.
3. Create the `flashlearn_db` database and run the SQL script above in phpMyAdmin or the MySQL command line.
4. Copy the project folder into the web server document root, for example `htdocs/flash-cards/`.
5. Check that the database connection settings in `server.php` match your local MySQL configuration.
6. Open the app through the local server:

   `http://localhost/flash-cards/`

7. Register an account, log in, and start adding flashcards.

> Do not open `index.html` directly using a `file://` URL. The PHP backend requires a running PHP server and MySQL database.

## Backend actions

The frontend sends POST requests to `server.php` with an `action` parameter.

| Action | Purpose |
|---|---|
| `register` | Creates a user and stores a password hash |
| `login` | Checks the submitted password against the stored hash |
| `add_flashcard` | Saves a question and answer for a username |
| `get_flashcards` | Retrieves flashcards for a username |
| `delete_flashcard` | Deletes a flashcard by username and question |
| `get_user_xml` | Returns the username in an XML response |

## Implementation notes and limitations

- SQL statements use prepared statements with bound parameters for the database operations shown in the PHP file.
- The frontend validates usernames and passwords, but equivalent server-side validation should also be added.
- The current backend does **not** use PHP sessions or another server-side authentication mechanism. Requests send a username with each AJAX call, and the backend trusts that username. As written, this is a learning/demo project and should not be used with real user accounts or sensitive data without adding proper authentication and authorization.
- Database credentials are hard-coded for local development. Use environment variables or a protected configuration file outside the public web root before deploying.
- The `get_user_xml` action demonstrates XML output; the main application operations use JSON.
- The app depends on the database schema above and a working PHP/MySQL environment.

## Possible future improvements

- Add PHP sessions and server-side authorization for every flashcard operation.
- Move database credentials into environment variables or a configuration file outside the public web root.
- Add server-side validation and clearer HTTP status codes.
- Add confirmation/feedback after creating or deleting a card.
- Add editing and categorization of flashcards, if needed.
