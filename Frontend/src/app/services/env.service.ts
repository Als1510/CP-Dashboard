import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  Mongo_API_URL = environment.mongoApiUrl;
  constructor() { }
}