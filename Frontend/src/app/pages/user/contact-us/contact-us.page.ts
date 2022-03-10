import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})

export class ContactUsPage implements OnInit {

  contactForm: FormGroup
  constructor(
    private _formBuilder: FormBuilder,
    private _alertService: AlertService
  ) { }

  ngOnInit() {
    this.contactForm = this._formBuilder.group({
      name: ["", Validators.required],
      email: ["", Validators.required],
      contactNo: [""],
      message: ["", Validators.required],
    })
  }

  onSubmit() {
    let data = `name: ${this.contactForm.get('name').value}, email: ${this.contactForm.get('email').value}, email: ${this.contactForm.get('email').value}, message: ${this.contactForm.get('message').value}`
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString(),
    })
      .then(() => this._alertService.presentToast('We\'ll contact you soon', 'success'))
      .catch((error) => this._alertService.presentToast('error', 'danger'));
    this.contactForm.reset()
  }

}
