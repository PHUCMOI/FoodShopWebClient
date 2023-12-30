import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import validateForm from 'src/app/helper/ValidateForm';
import { RegisterService } from 'src/app/services/register.service';

@Component({
  selector: 'app-signup',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{

  public signupForm!: FormGroup;
  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';

  constructor(private fb: FormBuilder, private register: RegisterService, private router: Router) {}
  
  ngOnInit() {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.required]
    });
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  onSignUp() {
    if(this.signupForm.valid)
    {
      console.log(this.signupForm.value)
      this.register.register(this.signupForm.value).subscribe({
        next:(res: any) => {
          this.signupForm.reset();
          this.router.navigate(['login']);
        },
        error:(err: any) =>{
          alert(err?.error.message)
        }
      })
    }
    else
    {
      validateForm.validateAllFormFields(this.signupForm)
    }
  }
}