import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { NetlifyFormService } from 'src/app/services/netlify-form.service';

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
      name: ["", Validators.required],
      email: ["", Validators.required],
      contactNo: [""],
      message: ["", Validators.required],
    })
  }

  onSubmit() {
    this._netlifyFormService.submitFeedback(this.contactForm.value).subscribe(
      ()=> {
        this.contactForm.reset();
        this._alertService.presentToast('We\'ll contact you soon', 'success')
      }
    )
  }

}
