import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { DataTable } from '../data-tables/models/data-table.model';

const API_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(private http: HttpClient) {}

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
    return this.http.post(API_URL + '/api/data-tables', dataTable).pipe(
      catchError((error) => {
        return this.handleError(error);
      })
      // response of this function will be a json object...
    );
  }

  public updateDataTable(dataTable: DataTable) {
    return this.http
      .put(API_URL + '/api/data-tables/' + dataTable._id, dataTable, {
        params: {
          hello: '2',
          http: 'testtttt',
          // test http parameters...
        },
      })
      .pipe(
        catchError((error) => {
          return this.handleError(error);
        })
        // response of this function will be a json object...
      );
  }

  public deleteDataTable(dataTable: DataTable) {
    return this.http.delete(API_URL + '/api/data-tables/' + dataTable._id).pipe(
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: Response | any) {
    console.error('ApiService::handleError', error);
    return throwError(error.message);
  }
}
