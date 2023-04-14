import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';
import { environment } from 'src/environments/environment';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const FIREBASE_SIGNUP_URL = environment.firebaseSignUpUrl;
const FIREBASE_LOGIN_URL = environment.firebaseSignInUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // a behaviour subject will return the current value on subscription
  // a normal subject will only return its value on "next()" being called
  user = new BehaviorSubject<User>(null);
  tokenExpirationTimer: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(FIREBASE_SIGNUP_URL, {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((res) => {
          this.handleAuth(res);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(FIREBASE_LOGIN_URL, {
        email: email,
        password: password,
        returnSecureToken: true,
      })
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((res) => {
          this.handleAuth(res);
        })
      );
  }

  logout() {
    localStorage.clear();
    this.user.next(null); // using .next() on a BehaviorSubject sets its value
    this.router.navigate(['/auth']);

    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogin() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.id,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expiresInTime =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();

      this.autoLogout(expiresInTime);
    }
  }

  autoLogout(expirationDuration: number) {
    // console.log('time left for token (ms): ' + expirationDuration);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuth(res: AuthResponseData) {
    const expiresInTime = +res.expiresIn * 1000; // in milliseconds
    const expirationDate = new Date(new Date().getTime() + expiresInTime);
    const user = new User(res.email, res.localId, res.idToken, expirationDate);
    this.user.next(user);
    this.autoLogout(expiresInTime);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(errorRes) {
    let errorMessage = 'An unknown error occurred';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists';
        break;
      case 'EMAIL_NOT_FOUND':
        errorMessage = 'Incorrect email/password';
        break;
      case 'INVALID_PASSWORD':
        errorMessage = 'Incorrect email/password';
        break;
      case 'INVALID_EMAIL':
        errorMessage = 'Invalid email address';
        break;
    }
    return throwError(errorMessage);
  }
}
