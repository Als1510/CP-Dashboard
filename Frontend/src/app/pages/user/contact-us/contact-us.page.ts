import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  contactForm: FormGroup
  constructor(
    private _formBuilder: FormBuilder,
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
    console.log("Hello")
  }

}
