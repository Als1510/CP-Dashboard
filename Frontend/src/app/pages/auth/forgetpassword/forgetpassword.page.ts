import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoaderService } from 'src/app/services/loader.service';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.page.html',
  styleUrls: ['./forgetpassword.page.scss'],
})
export class ForgetpasswordPage implements OnInit {

  resetPasswordForm: FormGroup
  hide = false
  showTimer = false

  constructor(
    private _router: Router,
    private _formBuilder: FormBuilder,
    private _alertController: AlertController,
    private _loaderService: LoaderService,
    private _authService: AuthService,
    private _alertService: AlertService
  ) { }

  ngOnInit() {
    this.showCard('form1')
    this.hideCard('form2')
    this.resetPasswordForm = this._formBuilder.group({
      email: ["", Validators.required],
      otp: ["", Validators.required],
      password: ["", Validators.required],
      confirmPassword: ["", Validators.required]
    })
  }

  disableTimer() {
    this.showTimer = false
  }

  back(){
    this.showCard('form1')
    this.hideCard('form2')
    this.disableTimer()
  }

  eye() {
    this.hide = !this.hide;
  }

  showCard(id) {
    document.getElementById(id).style.display = '';
  }

  hideCard(id) {
    document.getElementById(id).style.display = 'none';
  }

  async presentAlert(msg, name) {
    const alert = await this._alertController.create({
      header: `Dear ${name}`,
      message: `${msg}`
    })

    await alert.present();

    setTimeout(()=>{
      alert.dismiss()
    }, 3000)
  }

  timer(remain) {
    if(this.showTimer) {
      let m = Math.floor(remain / 60)
      let s = remain % 60
      
      let result = '0'+m+':';
      
      if(s<10) {
        result += '0'+s
      } else{
        result += s
      }
      
      let timerId = document.getElementById('time_left')
      
      if(m ==0 && s<=30) {
        timerId.classList.add('danger')
      }
      
      timerId.innerHTML = result
      remain -= 1
      
      if(remain >= 0) {
        setTimeout(() => {
          this.timer(remain)
        }, 1000);
        return;
      } else {
        this._alertService.presentToast('OTP time out', 'danger')
        this._router.navigate(['login'])
      }
    }
  }

  submitEmail() {
    this.showCard('form2')
    this.hideCard('form1')
    this.showTimer = true
    this.timer(120)
    let email = this.resetPasswordForm.get('email').value.toLowerCase()
    this._authService.requestOtp(email).subscribe(
      data => {
        this._loaderService.isLoading.next(false)
        this.presentAlert(data['msg'], data['name']);
      }
    )
  }

  resetPassword() {
    let email = this.resetPasswordForm.get('email').value.toLowerCase()
    let otp = this.resetPasswordForm.get('otp').value
    let password = this.resetPasswordForm.get('password').value
    let confirmPassword = this.resetPasswordForm.get('confirmPassword').value

    if(password !== confirmPassword) {
      this._loaderService.isLoading.next(false)
      this._alertService.presentToast("Password does not match",'danger')
      return
    }

    this._authService.resetPassword(email, otp, password).subscribe(
      data => {
        this._loaderService.isLoading.next(false)
        this._alertService.presentToast(data['msg'], 'success')
        this.disableTimer()
        this._router.navigate(['login'])
      }
    )
  }
}