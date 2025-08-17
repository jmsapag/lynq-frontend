# API Documentation: Connections Module

This document provides a comprehensive guide to the API endpoints for managing external provider connections within the LYNQ API.

## Endpoints Summary

| Method | Route                             | Description                                            |
| :----- | :-------------------------------- | :----------------------------------------------------- |
| `POST` | `/connections/test`               | Tests a new connection's credentials without saving it.  |
| `POST` | `/connections`                    | Creates a new connection after a successful credentials test. |
| `GET`  | `/connections`                    | Retrieves all connections for all businesses.          |
| `GET`  | `/connections/business/:businessId` | Retrieves all connections for a specific business.     |
| `GET`  | `/connections/:id`                | Retrieves a single connection by its ID.               |
| `PUT`  | `/connections/:id`                | Updates an existing connection's name or credentials.  |
| `DELETE`| `/connections/:id`               | Deletes a connection by its ID.                        |

---

## 1. Test Connection Credentials

Tests a connection without saving it. This is useful for validating user input in the frontend before attempting to create a connection.

-   **Endpoint:** `POST /connections/test`
-   **Request Body:** See [Request Body Structure](#request-body-structure).
-   **Responses:**
    -   `201 Created`: If the test is successful.
        ```json
        { "success": true }
        ```
    -   `400 Bad Request`: If credentials are invalid or the request body is malformed.
        ```json
        {
          "statusCode": 400,
          "message": "Invalid credentials provided",
          "error": "Bad Request"
        }
        ```

---

## 2. Create a New Connection

Creates and persists a new connection. The API will internally perform a connection test before saving. If the test fails, the connection will not be created.

-   **Endpoint:** `POST /connections`
-   **Request Body:** See [Request Body Structure](#request-body-structure).
-   **Responses:**
    -   `201 Created`: Returns the newly created connection object.
    -   `400 Bad Request`: If the connection test fails or the request body is invalid.
    -   `409 Conflict`: If a connection with the same unique parameters (e.g., provider and user for the same business) already exists.

---

## 3. Retrieve Connections

### Get All Connections

-   **Endpoint:** `GET /connections`
-   **Response:** `200 OK` with an array of connection objects.

### Get Connections by Business

-   **Endpoint:** `GET /connections/business/:businessId`
-   **URL Parameters:**
    -   `businessId` (number): The ID of the business.
-   **Response:** `200 OK` with an array of connection objects belonging to the specified business.

### Get a Single Connection

-   **Endpoint:** `GET /connections/:id`
-   **URL Parameters:**
    -   `id` (number): The ID of the connection.
-   **Response:**
    -   `200 OK` with the connection object.
    -   `404 Not Found`: If no connection with the specified ID exists.

---

## 4. Update a Connection

Updates a connection's name and/or its authentication parameters. If `authParams` are provided, they will be tested before the update is applied.

-   **Endpoint:** `PUT /connections/:id`
-   **URL Parameters:**
    -   `id` (number): The ID of the connection to update.
-   **Request Body:** See [Request Body Structure](#request-body-structure). All fields are optional.
-   **Responses:**
    -   `200 OK`: Returns the updated connection object.
    -   `400 Bad Request`: If new credentials in `authParams` fail the connection test.
    -   `404 Not Found`: If no connection with the specified ID exists.

---

## 5. Delete a Connection

Permanently deletes a connection and its associated credentials.

-   **Endpoint:** `DELETE /connections/:id`
-   **URL Parameters:**
    -   `id` (number): The ID of the connection to delete.
-   **Responses:**
    -   `200 OK`: Returns the deleted connection object.
    -   `404 Not Found`: If no connection with the specified ID exists.

---

## Request Body Structure

This structure is used for `POST` and `PUT` requests.

```json
{
  "name": "My Production FootfallCam",
  "provider": "FootfallCam V9 API",
  "businessId": 1,
  "authParams": {
    "user": "your_footfallcam_user",
    "password": "your_footfallcam_password"
  }
}
```

### Fields

-   **`name`** (string, required on `POST`): A descriptive, human-readable name for the connection.
-   **`provider`** (string, required on `POST`): The name of the external provider.
    -   Currently supported values: `"FootfallCam V9 API"`
-   **`businessId`** (number, required on `POST`): The ID of the business this connection belongs to.
-   **`authParams`** (object, required on `POST`): An object containing the credentials. Its structure depends on the `provider`.
    -   For `"FootfallCam V9 API"`:
        -   `user` (string, required)
        -   `password` (string, required)
