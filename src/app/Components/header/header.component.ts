import { Component, computed, signal } from '@angular/core';
import { GreetingService } from '../../Services/greeting.service';
import { OpacityService } from '../../Services/opacity.service';
@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  
  greeting: string = "";
  constructor(
    public greetingService: GreetingService,
    public opacityService: OpacityService
  ){}
  opacity = computed(() => this.opacityService.opacity())
  
  ngOnInit (){
    this.greeting= this.greetingService.getGreeting()
  }

}
