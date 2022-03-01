import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup
  hide = false

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _tokenService: TokenService,
    private _loaderService: LoaderService
  ) { }

  ngOnInit() {
    this.loginForm = this._formBuilder.group({
      email: ["", Validators.required],
      password: ["", Validators.required]
    })
  }

  eye(){
    this.hide = !this.hide
  }

  onSubmit() {
    let email = this.loginForm.get('email').value.toLowerCase()
    let password = this.loginForm.get('password').value
    this._authService.login(email, password).subscribe(
      async data => {
        this._loaderService.isLoading.next(false)
        await this._tokenService.saveNameIdUserName(data['name'], data['id'], data['username'])
        await this._tokenService.setToken(data['token'])
        await this._router.navigate(['/User/dashboard'])
        this.loginForm.reset()
      }
    )
  }
}
