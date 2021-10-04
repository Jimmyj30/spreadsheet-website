import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // a behaviour subject will return the current value on subscription
  // a normal subject will only return its value on "next()" being called
  user = new BehaviorSubject<User>(null);
  tokenExpirationTimer: ReturnType<typeof setTimeout>;

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDxJ2Jih5LV5E62kkesLIr1pQb7dApw6Tk',
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((res) => {
          this.handleAuth(res);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDxJ2Jih5LV5E62kkesLIr1pQb7dApw6Tk',
        { email: email, password: password, returnSecureToken: true }
      )
      .pipe(
        catchError((error) => this.handleError(error)),
        tap((res) => {
          this.handleAuth(res);
        })
      );
  }

  logout() {
    localStorage.clear();
    this.user.next(null);
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
    console.log(expirationDuration);
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
    }
    return throwError(errorMessage);
  }
}
