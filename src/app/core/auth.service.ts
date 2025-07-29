import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
    private router = inject(Router);
  readonly user$: Observable<any> = authState(this.auth);
  
  redirectAfterLogout(){
    // Implement your redirect logic here, e.g., navigate to the login page
    console.log('Redirecting after logout...');
    this.router.navigate(['/auth']);
  }

  login(email: string, pw: string) {
    return signInWithEmailAndPassword(this.auth, email, pw);
  }
  logout() {
    return signOut(this.auth);
  }
}
