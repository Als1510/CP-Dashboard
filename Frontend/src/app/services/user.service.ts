import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EnvService } from './env.service';
import { PlatformResponse, PlatformUpdateResponse } from '../models/platform.model';
  
@Injectable({
  providedIn: 'root'
})
export class UserService {

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  constructor(
    private _http: HttpClient,
    private _env: EnvService
  ) { }

  getPlatforms() {
    return this._http.get<PlatformResponse>(this._env.Mongo_API_URL+'/platform/details', this.httpOptions)
  }

  updatePlatform(platformName: string, username: string) {
    return this._http.put<PlatformUpdateResponse>(this._env.Mongo_API_URL+'/platform/updateplatform', {platformName, username}, this.httpOptions)
  }

  getUserDetails(platform, username) {
    return this._http.get(this._env.Mongo_API_URL+`/${platform}/${username}`, this.httpOptions)
  }

  refreshUserDetails(platform, username) {
    return this._http.post(this._env.Mongo_API_URL+`/${platform}/${username}/refresh`, null, this.httpOptions)
  }

  getLeetCodeRecentSubmissions(username) {
    return this._http.get(this._env.Mongo_API_URL+`/leetcode/${username}/submissions`, this.httpOptions)
  }
}
