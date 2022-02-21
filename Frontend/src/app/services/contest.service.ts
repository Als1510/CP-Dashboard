import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { EnvService } from './env.service';


@Injectable({
  providedIn: 'root'
})
export class ContestService {

  constructor(
    private _http: HttpClient,
    private _env: EnvService
  ) { }

  // GET Upcoming contest
  upcomingContest() {
    return this._http.get(this._env.Contest_API_URL);
  }
}
