import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { contactUs } from '../pages/utils/contactUs';

@Injectable({
  providedIn: 'root'
})
export class NetlifyFormService {
  
  constructor(private http: HttpClient) { }

  submitFeedback(formEntry: contactUs): Observable<any> {
    const entry = new HttpParams({ fromObject: {
      'form-name': 'contactForm',
      ...formEntry,
    }});

    return this.submitEntry(entry);
  }

  private submitEntry(entry: HttpParams): Observable<any> {
    return this.http.post(
      '/',
      entry.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'text'
      }
    ).pipe(catchError(this.handleError));
  }

  private handleError(err: HttpErrorResponse) {
    let errMsg = '';

    if (err.error instanceof ErrorEvent) {
      errMsg = `A client-side error occurred: ${err.error.message}`;
    } else {
      errMsg = `A server-side error occurred. Code: ${err.status}. Message: ${err.message}`;
    }

    return throwError(errMsg);
  }
}
