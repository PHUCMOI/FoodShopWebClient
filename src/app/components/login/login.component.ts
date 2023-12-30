import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import validateForm from 'src/app/helper/ValidateForm';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  
  public loginForm!: FormGroup;
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';

  constructor(private fb: FormBuilder, 
    private login: LoginService,
    private router: Router,
    private toast: NgToastService) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSubmit() {
    if(this.loginForm.valid) 
    {
      console.log("submit");  
    }
    else
    {
      console.log("is not valid");
      validateForm.validateAllFormFields(this.loginForm);
      alert("Username or Password is not correct!")
    }
  }

  onLogin() {
    if(this.loginForm.valid) 
    {
      this.login.login(this.loginForm.value).subscribe({
        next:(res) => {
          this.loginForm.reset();
          console.log("Login");
          this.login.storeToken(res.accessToken)
          this.toast.success({detail: "SUCCESS", summary:"Welcome" + res.username, duration: 5000});
          this.router.navigate(['product'])
          this.login.isLoged.next(true);
          let token = this.login.getinfo();
          let role = token.role;
            if(role == "Admin"){
              this.login.isAdmin.next(true);
            }
        },
        error:(err) => {
          this.toast.error({detail: "FAILED", summary: "Something when wrong!", duration: 5000});
        }
      })
    }
    else
    {
      console.log("is not valid");
      validateForm.validateAllFormFields(this.loginForm);
      alert("Username or Password is not correct!")
    }
  }
}
