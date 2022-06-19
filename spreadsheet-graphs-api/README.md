# Spreadsheet Graphs API (Lab Data Processor)

- This project is the API backend for the lab data processor.

## About

- This API backend can perform CRUD operations on a MongoDB database.
- It is authenticated using Firebase Auth and can handle basic user roles.

## Other Information

- Further information about data schemas can be found in the files in the `/schemas` folder in this repo.
- Information about the data table model can be found at `/dataTableModel.js`.

## Requests

- `<API_URL>/api/data-tables`

  - `POST`
    - **Generates a new data table**
    - In headers:
      - `Authorization`: `Bearer <FIREBASE_TOKEN>`
    - In body:
      - `dataTableData`
        - `dataTableData` is an array of `dataPoints`
      - `yCurveStraighteningInstructions`
        - `yCurveStraighteningInstructions` is an `instruction`
      - `xCurveStraighteningInstructions`
        - `xCurveStraighteningInstructions` is an `instruction`
  - `GET`
    - **Gets all the data tables stored in the DB**
      - Only the "admin" accounts have the permissions to use this request.
    - In headers:
      - `Authorization`: `Bearer <FIREBASE_TOKEN>`

- `<API_URL>/api/data-tables/<DATA_TABLE_ID>`
  - `PUT`
    - **Updates an existing data table**
      - `<DATA_TABLE_ID>` specifies a table id to change (as long as the user has permissions to do so).
    - In headers:
      - `Authorization`: `Bearer <FIREBASE_TOKEN>`
    - In body:
      - `dataTableData`
        - `dataTableData` is an array of `dataPoints`
      - `yCurveStraighteningInstructions`
        - `yCurveStraighteningInstructions` is an `instruction`
      - `xCurveStraighteningInstructions`
        - `xCurveStraighteningInstructions` is an `instruction`
  - `GET`
    - **Gets a data table by id**
      - A `GET` request can also be sent to `<API_URL>/api/data-tables/x?view-by-firebase-uid=true` in order to get the data table corresponding to the user associated with the firebase token sent in the response headers.
    - In headers:
      - `Authorization`: `Bearer <FIREBASE_TOKEN>`
  - `DELETE`
    - **Deletes a data table by id**
    - In headers:
      - `Authorization`: `Bearer <FIREBASE_TOKEN>`

## Running the Project

- The backend (`spreadsheet-graphs-api`) can be run locally by starting up a local mongoDB instance with `mongod`, changing directories into the backend (`spreadsheet-graphs-api`) folder (on another terminal) and then running `nodemon`.
