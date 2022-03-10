import { HttpClient, HttpParams } from '@angular/common/http';
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
    private _alertService: AlertService,
    private http: HttpClient
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
    const data = new HttpParams().set('contact-form', 'ContactForm')
      .append('name', this.contactForm.value.name)
      .append('email', this.contactForm.value.email)
      .append('contactNo', this.contactForm.value.contactNo)
      .append('message', this.contactForm.value.message)
    this.http.post('/', data.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).subscribe(
      res => {
        this._alertService.presentToast('Form submitted successfully. We\' contact you soon', 'success')
      })
    this.contactForm.reset()
  }
}
