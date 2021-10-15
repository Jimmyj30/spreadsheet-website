import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, take, mergeMap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { DataTable } from '../data-tables/models/data-table.model';
import { AuthService } from '../auth/auth.service';

const API_URL = environment.apiUrl;
// TODO: Add firebase auth for user authentication
// and connect that with mongoDB backend
// https://javascript.plainenglish.io/lets-create-react-app-with-firebase-auth-express-backend-and-mongodb-database-805c83e4dadd

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  // api requests ???
  // https://www.sitepoint.com/angular-rxjs-create-api-service-rest-backend/
  // https://levelup.gitconnected.com/simple-application-with-angular-6-node-js-express-2873304fff0f

  // Commands...
  // GET /api/data-tables will list all data tables
  // POST /api/data-tables will make a new data table
  // GET /api/data-tables/{id} will list a single data table
  // PUT /api/data-tables/{id} update a single data table
  // DELETE /data-tables/{id} will delete a single data table

  public createDataTable(dataTable: DataTable) {
    return this.authService.user
      .pipe(
        take(1),
        mergeMap((user) => {
          return this.http.post(API_URL + '/api/data-tables', dataTable, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
    // response of this function will be a json object...
  }

  public getDataTableByFirebaseUid() {
    return this.authService.user
      .pipe(
        take(1),
        mergeMap((user) => {
          let getDataByUidPathString = 'x';
          return this.http.get(
            API_URL + '/api/data-tables/' + getDataByUidPathString,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
              params: {
                'view-by-firebase-uid': 'true',
              },
            }
          );
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  public updateDataTable(dataTable: DataTable) {
    return this.authService.user
      .pipe(
        take(1),
        mergeMap((user) => {
          return this.http.put(
            API_URL + '/api/data-tables/' + dataTable._id,
            dataTable,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
    // response of this function will be a json object...
  }

  public deleteDataTable(dataTable: DataTable) {
    return this.authService.user
      .pipe(
        take(1),
        mergeMap((user) => {
          return this.http.delete(
            API_URL + '/api/data-tables/' + dataTable._id,
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
        })
      )
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
      );
  }

  private handleError(error: Response | any) {
    console.error('DataStorageService::handleError', error);
    return throwError(error.message);
  }
}
