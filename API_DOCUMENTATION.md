# MindMate API Documentation

This document provides detailed information about the MindMate backend APIs for frontend integration.

## Base URL
`http://localhost:8000` (Default)

## Authentication
Most APIs require authentication using a JSON Web Token (JWT).
- **Header**: `Authorization`
- **Format**: `Bearer <your_token>`

---

## 1. Authentication APIs

### 1.1 Sign Up
Register a new user account.

- **Endpoint**: `/auth/signup`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "success",
    "id": "user_mongodb_id"
  }
  ```

### 1.2 Login
Authenticate with email and password.

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "jwt_token_string",
    "email": "john@example.com"
  }
  ```

### 1.3 Google Login
Authenticate using a Google OAuth token.

- **Endpoint**: `/auth/loginWithGoogle`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "tokenId": "google_oauth_token"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Logged in successfully",
    "token": "jwt_token_string",
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@email.com"
    }
  }
  ```

---

## 2. Diary APIs

### 2.1 Create Diary Entry
- **Endpoint**: `/diary`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "content": "Today was a great day...",
    "emotions": {
      "happy": 8,
      "sad": 2,
      "angry": 0,
      "anxious": 1,
      "calm": 7,
      "excited": 5,
      "grateful": 9,
      "hopeful": 8
    },
    "isPublic": false
  }
  ```
  *Note: emotions is optional. Values range 0-10.*
- **Response (201 Created)**:
  ```json
  {
    "message": "Diary entry created",
    "data": {
      "id": "entry_id",
      "content": "...",
      "emotions": { ... },
      "isPublic": false,
      "createdAt": "timestamp"
    }
  }
  ```

### 2.2 Get All User Diary Entries
- **Endpoint**: `/diary`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "_id": "...",
        "content": "...",
        "user": "...",
        "emotions": { ... },
        "isPublic": false,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
  ```

### 2.3 Get Public Diary Entries
- **Endpoint**: `/diary/public`
- **Method**: `GET`
- **Auth Required**: Yes (Verified via authMiddleware)
- **Response (200 OK)**:
  ```json
  {
    "data": [ ... ]
  }
  ```

### 2.4 Get Specific Diary Entry
- **Endpoint**: `/diary/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "data": { ... }
  }
  ```

### 2.5 Update Diary Entry
- **Endpoint**: `/diary/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**: (All fields optional)
  ```json
  {
    "content": "Updated content...",
    "emotions": { ... },
    "isPublic": true
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Diary is updated successfully",
    "data": { ... }
  }
  ```

### 2.6 Delete Diary Entry
- **Endpoint**: `/diary/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Diary entry successfully deleted"
  }
  ```

---

## 3. Gratitude Journal APIs

### 3.1 Create Gratitude Entry
- **Endpoint**: `/gratitude`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "content": "I am grateful for my friends."
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "...",
    "data": {
      "content": "..."
    }
  }
  ```

### 3.2 Get Specific Gratitude Entry
- **Endpoint**: `/gratitude/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response (200 OK)**:
  ```json
  {
    "data": { ... }
  }
  ```

---

## 4. Chat (AI) APIs

### 4.1 Send Chat Message
Interact with the MindMate AI.

- **Endpoint**: `/chat`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "message": "How can I improve my mood?"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "reply": "AI suggested reply content..."
  }
  ```

---

## Error Responses

Common error status codes:
- `400 Bad Request`: Validation error or missing fields.
- `401 Unauthorized`: Missing or invalid Bearer token.
- `404 Not Found`: Resource (diary/gratitude) does not exist.
- `500 Internal Server Error`: Server-side error.

**Example Error Body**:
```json
{
  "error": "Error message description"
}
```
