import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { LoaderService } from 'src/app/services/loader.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-platforms',
  templateUrl: './platforms.page.html',
  styleUrls: ['./platforms.page.scss'],
})
export class PlatformsPage implements OnInit {

  platforms = new Array();
  platformForm: FormGroup

  constructor(
    private _userSerive: UserService,
    private _loaderService: LoaderService,
    private _formBuilder: FormBuilder,
    private _alertService: AlertService
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
    this.platformForm.controls['platformName'].setValue(data)
    let card = document.getElementById('modal')
    card.style.display = 'block';
  }

  hideCard() {
    this.platformForm.controls['platformName'].setValue(null)
    let card = document.getElementById('modal')
    card.style.display = 'none';
  }

  getplatform() {
    this.platforms = new Array()
    this._userSerive.getPlatforms().subscribe(data => {
      console.log(data['platformData'].platform)
      for(let prop in data['platformData'].platform) {
        if(!data['platformData'].platform[prop])
          this.platforms.push(prop)
      }
    })
    this._loaderService.isLoading.next(false)
  }

  onSubmit() {
    let platformName = this.platformForm.get('platformName').value
    let username = this.platformForm.get('username').value
    this._userSerive.getUserDetails(platformName, username).subscribe(
      data => {
        if(data["status"]==="OK") {
          this._userSerive.updatePlatform(platformName, username).subscribe(
            data=>{
              this._alertService.presentToast(data['msg'], 'success')
              this.getplatform()
              this.hideCard()
            }
          )
        }
        this._loaderService.isLoading.next(false)
      }
    )
  }
}