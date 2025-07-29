import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  private auth = inject(AuthService);
  user$ = this.auth.user$;
  logout() { 
    this.auth.logout(); 
    console.log('User logged out');
    
    this.auth.redirectAfterLogout();  // Redirect after logout

  }

}
