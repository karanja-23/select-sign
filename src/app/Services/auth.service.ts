import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn =  new BehaviorSubject<boolean>(true);

  isLoggedIn = this.loggedIn.asObservable();

  logIn() {
    this.loggedIn.next(true);
  }
  logOut() {
    this.loggedIn.next(false);
  }
  getIsLoggedIn(): boolean {
    return this.loggedIn.getValue();
  }
}
