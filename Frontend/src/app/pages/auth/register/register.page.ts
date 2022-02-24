import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  registerForm: FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _authService: AuthService
  ) { }

  ngOnInit() {
    this.registerForm = this._formBuilder.group({
      name: ["", Validators.required],
      username: ["", Validators.required],
      email: ["", Validators.required],
      password: ["", Validators.required]
    })
  }

  onSubmit() {
    let name = this.registerForm.get('name').value
    let username = this.registerForm.get('username').value.toLowerCase()
    let email = this.registerForm.get('email').value.toLowerCase()
    let password = this.registerForm.get('password').value
    this._authService.register(name, username, email, password).subscribe(
      async data => {
        console.log(data)
        await this._router.navigate(['login']);
      }
    )
  }
}
