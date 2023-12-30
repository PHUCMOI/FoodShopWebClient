import { Injectable } from '@angular/core';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private loginService: LoginService, private toast: NgToastService, private router: Router) { }
  canActivate(): boolean {
    if (!this.loginService.isLoggedIn()) {
      this.toast.error({detail:"ERROR", summary:"Please Login First!"});
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}