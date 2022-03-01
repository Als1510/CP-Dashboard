import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  // Mongo_API_URL = 'http://localhost:5000/api'
  Mongo_API_URL = 'https://competitivepdashboard.herokuapp.com/api'
  Contest_API_URL = 'https://kontests.net/api/v1/all';

  constructor() { }
}
