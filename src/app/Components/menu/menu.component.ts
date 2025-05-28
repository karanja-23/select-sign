import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OpacityService } from '../../Services/opacity.service';
@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuWidth = '60px';
  isImageVisible = false;
  imgSource = 'assets/logo.png';
  

  constructor(public opacityService:OpacityService){}
  opacity = computed(() =>this.opacityService.opacity())
  
  onMouseEnter() {
    this.menuWidth = '200px';
    this.isImageVisible = true;
   

  }
 
  onMouseLeave() {
    this.menuWidth = '60px';
    this.isImageVisible = false;
   
  }
}
