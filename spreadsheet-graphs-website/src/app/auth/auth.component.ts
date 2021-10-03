import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  isLoginMode = true;
  loading = false;

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm): void {
    const email = form.value.email;
    const password = form.value.password;

    this.loading = true;
    if (this.isLoginMode) {
    } else {
      this.authService.signup(email, password).subscribe(
        (res) => {
          this.loading = false;
          console.log(res);
        },
        (error) => {
          this.loading = false;
          console.log(error);
        }
      );
    }

    form.reset();
  }
}
