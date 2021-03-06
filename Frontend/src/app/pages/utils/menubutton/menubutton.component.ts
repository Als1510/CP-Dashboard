import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-menubutton',
  templateUrl: './menubutton.component.html',
  styleUrls: ['./menubutton.component.scss'],
})
export class MenubuttonComponent implements OnInit {

  toggle_by_button = false
  name
  username

  constructor(
    private _router: Router,
    private _tokenService: TokenService
  ) { }

  ngOnInit() {
    this.name = this._tokenService.getName()
    this.username = this._tokenService.getUserName()
  }
    
  toggleBtn() {
    let btn = document.querySelector('#btn');
    let sidebar = document.querySelector('.sidebar')
    btn.classList.toggle('active')
    sidebar.classList.toggle('active')
    if(this.toggle_by_button){
      this.toggle_by_button = false
    } else {
      this.toggle_by_button = true
    }
  }
  
  overBtn() {
    let btn = document.querySelector('#btn');
    let sidebar = document.querySelector('.sidebar')
    if(!this.toggle_by_button) {
      btn.classList.toggle('active')
      sidebar.classList.toggle('active')
    } 
  }

  outBtn() {
    let btn = document.querySelector('#btn');
    let sidebar = document.querySelector('.sidebar')
    if(!this.toggle_by_button) {
      btn.classList.remove('active')
      sidebar.classList.remove('active')
    }
  }

  clickEvent(data) {
    this._router.navigate([data])
  }

  logout() {
    this._tokenService.logout()
    this._router.navigate(['/home']);
  }
}
