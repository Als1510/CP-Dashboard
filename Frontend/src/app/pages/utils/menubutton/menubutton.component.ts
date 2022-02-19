import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menubutton',
  templateUrl: './menubutton.component.html',
  styleUrls: ['./menubutton.component.scss'],
})
export class MenubuttonComponent implements OnInit {

  constructor(private _router: Router) { }

  ngOnInit() {}

    
  toggleBtn() {
    let btn = document.querySelector('#btn');
    btn.classList.toggle('active')
    
    let sidebar = document.querySelector('.sidebar')
    sidebar.classList.toggle('active')
  }

  logout() {
    this._router.navigate(['/home']);
  }

}
