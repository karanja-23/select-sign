import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OpacityService {

  constructor() { }
  opacity = signal(0.9)

  setOpacity(value: number){
    this.opacity.set(value)
  }
  resetOpacity(){
    this.opacity.set(0.88)
  }
}
