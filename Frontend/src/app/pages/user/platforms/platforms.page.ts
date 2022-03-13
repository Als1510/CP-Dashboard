import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { TokenService } from 'src/app/services/token.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.page.html',
  styleUrls: ['./platforms.page.scss'],
})

export class PlatformsPage implements OnInit {
  platforms = new Array();
  userPlatformData = new Array();
  platformForm: FormGroup

  constructor(
    private _userSerive: UserService,
    private _loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private _alertService: AlertService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tokenService: TokenService
  ) { }

  ngOnInit() {
    this.platformForm = this._formBuilder.group({
      platformName: ["", Validators.required],
      username: ["", Validators.required]
    })
    this.getplatform()
    this.hideCard()
  }

  showCard(data) {
    this.platformForm.controls['platformName'].setValue(data.key)
    this.platformForm.controls['username'].setValue(data.value)
    let card = document.getElementById('modal')
    card.style.display = 'block';
  }

  hideCard() {
    this.platformForm.controls['platformName'].setValue(null)
    this.platformForm.controls['username'].setValue(null)
    let card = document.getElementById('modal')
    card.style.display = 'none';
  }

  navigateTo(data) {
    let platformData = {
      [data]: this.platforms[data]
    }
    this._tokenService.setPlatform(platformData)
    this._router.navigate([data], {relativeTo: this._route})
  }

  getplatform() {
    this._userSerive.getPlatforms().subscribe(
      async data => {
      this.platforms = await data['platformData'].platform
      this._loaderService.isLoading.next(false)
      // await this.getUserPlatformData()
    })
  }

  getUserPlatformData() {
    for(let prop in this.platforms) {
      
      if(this.platforms[prop]) {
        this._userSerive.getUserDetails1(prop, this.platforms[prop]).subscribe( data => {
          console.log(data)
        })
      }
    }
    this._loaderService.isLoading.next(false)
  }

  onSubmit() {
    let platformName = this.platformForm.get('platformName').value
    let username = this.platformForm.get('username').value
    this._userSerive.updatePlatform(platformName, username).subscribe(
      data=>{
        this._alertService.presentToast(data['msg'], 'success')
        this.getplatform()
        this._loaderService.isLoading.next(false)  
      }
      )
    this.hideCard()
  }
}