import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  constructor() {}

  findError(err): { error: string; errorClass: string } {
    let error: string;
    let errorClass: string;

    if (err.match(/404 /g)) {
      error =
        "You don't have a data table saved yet—you can fill out the empty one above";
      errorClass = 'alert-primary';
    } else if (err.match(/4[0-9][0-9] /g)) {
      error = 'The request failed-please try again';
      errorClass = 'alert-danger';
    } else if (err.match(/5[0-9][0-9] /g)) {
      error = 'There was an error loading your data';
      errorClass = 'alert-danger';
    } else {
      error = 'An unknown error occurred';
      errorClass = 'alert-danger';
    }

    return { error: error, errorClass: errorClass };
  }
}
