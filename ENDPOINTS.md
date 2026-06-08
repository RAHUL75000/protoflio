# Project API Endpoints

This document outlines the API endpoints available in the backend of the Portfolio project.

## Base URL
Default: `http://localhost:5000`

## Endpoints

### 1. Get All Data
Returns the complete configuration and content for the portfolio.

- **URL:** `/api/data`
- **Method:** `GET`
- **Response Type:** `application/json`
- **Response Body:**
  ```json
  {
    "about": { ... },
    "footer": { ... },
    "general": { ... },
    "hero": { ... },
    "metrics": [ ... ],
    "process": [ ... ],
    "processHeader": { ... },
    "projects": [ ... ],
    "projectsHeader": { ... }
  }
  ```

### 2. Update Data
Updates the portfolio content. This is a protected endpoint used by the Admin panel.

- **URL:** `/api/data`
- **Method:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `X-Admin-Token: <token>` (Required)
- **Request Body:** The full JSON object representing the new state of the data.
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Data updated successfully" }`
- **Error Response:**
  - **Code:** 401 Unauthorized (if token is missing or incorrect)
  - **Content:** `{ "error": "Unauthorized" }`

### 3. Get Projects (Legacy/Specific)
Returns only the list of projects.

- **URL:** `/api/projects`
- **Method:** `GET`
- **Response Body:** Array of project objects.
  ```json
  [
    {
      "id": 1,
      "title": "Portfolio Website",
      "tech": ["React", "Flask", ...],
      ...
    }
  ]
  ```

## Data Schema (`data.json`)

The data structure follows this hierarchy:

- `general`: Logo and intro text.
- `hero`: Title, eyebrow, copy, and button text.
- `about`: About section copy and expertise list.
- `metrics`: Array of statistics (label/value pairs).
- `processHeader`: Kicker and title for the workflow section.
- `process`: Array of workflow steps.
- `projectsHeader`: Kicker and title for the work section.
- `projects`: Detailed array of project objects including tech stack and descriptions.
- `resume`: Object containing `header` (kicker, title, cvLink), `experience` (array), and `education` (array).
- `footer`: Email, social links, and CTA text.

## Security
- **Admin Token:** The `POST /api/data` endpoint requires an `X-Admin-Token`.
- **CORS:** The API allows cross-origin requests from any origin for paths starting with `/api/`.
