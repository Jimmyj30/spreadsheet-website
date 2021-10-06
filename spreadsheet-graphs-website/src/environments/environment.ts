// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // url for api
  // heroku url: https://spreadsheet-graphs-api.herokuapp.com
  // localhost url: http://localhost:8080
  apiUrl: 'http://localhost:8080',
  firebaseSignInUrl:
    'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDxJ2Jih5LV5E62kkesLIr1pQb7dApw6Tk',
  firebaseSignUpUrl:
    'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDxJ2Jih5LV5E62kkesLIr1pQb7dApw6Tk',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
