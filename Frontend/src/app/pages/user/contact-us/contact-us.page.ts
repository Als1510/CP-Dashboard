import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { NetlifyFormService } from 'src/app/services/netlifyForm.service';

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
    private _netlifyFormService: NetlifyFormService
  ) { }

  ngOnInit() {
    this.contactForm = this._formBuilder.group({
      name: ["John Doe", Validators.required],
      email: ["johndoe@gmail.com", Validators.required],
      contactNo: ["123"],
      message: ["Hello", Validators.required],
    })
  }

  onSubmit() {
    this._netlifyFormService.submitForm(this.contactForm.value).subscribe(
      data=> {
        console.log(data)
      }, error => {
        console.log(error)
      }
    )
    // this._alertService.presentToast('Form submitted successfully. We\' contact you soon', 'success')
    // this.contactForm.reset()
  }
}
