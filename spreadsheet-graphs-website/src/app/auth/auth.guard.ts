import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    router: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    return this.authService.user.pipe(
      map((user) => {
        return !!user;
      }),
      tap((user) => {
        if (!user) {
          this.router.navigate(['/auth']);
        }
      })
    );
  }

  // or we can return a URL tree instead of routing with the router...
}
