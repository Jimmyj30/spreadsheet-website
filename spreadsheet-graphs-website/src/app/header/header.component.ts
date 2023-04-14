import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private userSub: Subscription;
  isAuthenticated = false;
  userEmail = undefined;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((user) => {
      this.isAuthenticated = !!user;
    });
  }

  onLogout() {
    this.authService.user.subscribe(user => (this.userEmail = user.email));
    if (confirm(`Are you sure you want to logout as user ${this.userEmail}?`)) {
      this.authService.logout();
    }
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }
}
