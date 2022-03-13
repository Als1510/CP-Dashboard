import { Injectable } from '@angular/core';
const TOKEN_KEY = 'x-token'

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor() { }

  public setToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token)
  }

  public getToken(): string | ' ' {
    let token = localStorage.getItem(TOKEN_KEY);
    if(token) {
      return token
    } else {
      return '';
    }
  }

  getName() {
    return localStorage.getItem('name')
  }

  getUserName() {
    return localStorage.getItem('username')
  }

  getId() {
    return localStorage.getItem('id')
  }

  setPlatform(data: object) {
    localStorage.setItem('platform', JSON.stringify(data))
  }

  getPlatform() {
    return JSON.parse(localStorage.getItem('platform'))
  }

  saveNameIdUserName(name, id, username) {
    localStorage.removeItem('name')
    localStorage.removeItem('id')
    localStorage.removeItem('username')
    localStorage.setItem('username', username)
    localStorage.setItem('name', name)
    localStorage.setItem('id', id)
  }

  public logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('name')
    localStorage.removeItem('id')
    localStorage.removeItem('username')
  }
}
