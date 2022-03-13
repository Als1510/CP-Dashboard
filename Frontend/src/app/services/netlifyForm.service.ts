import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Contact } from "../pages/utils/contact";

@Injectable({
  providedIn: 'root'
})

export class NetlifyFormService{
  constructor(private _http: HttpClient) {}

  submitForm(formEntry: Contact){
    const data = new HttpParams({fromObject: {
      'form-name': 'contactForm',
      ...formEntry
    }})
    return this.submitEntry(data);
  }

  private submitEntry(data: HttpParams){
    return this._http.post(
      '/',
      data.toString(),
      {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        responseType: 'text'
      }
    )
  }
}