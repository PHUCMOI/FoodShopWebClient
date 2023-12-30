import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private login : LoginService, private toast: NgToastService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const myToken = this.login.getToken();

    if(myToken) {
      request = request.clone({
        setHeaders: {Authorization: `Bearer ${myToken}`} // "Bearer + Token"
      })
    }

    return next.handle(request).pipe(
      catchError((err : any) => {
        if(err instanceof HttpErrorResponse) {
          if(err.status == 401)
          {
            this.toast.warning({detail: "Warning", summary: "Token is expried, Login again!"})
            this.router.navigate(['login'])
          }
        }
        return throwError(() => new Error("Some other error occured"))
      })
    );
  }
}