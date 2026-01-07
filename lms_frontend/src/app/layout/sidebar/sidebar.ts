import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent implements OnInit {
  role: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.role = this.auth.getRole();
  }

  navigate(path: string) {
    console.log('Navigating to:', path);
    this.zone.run(() => {
      this.router.navigate([path]).then((success) => {
        console.log('Valid navigation:', success);
      });
    });
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  logout() {
    this.auth.logout();
    location.href = '/login';
  }
}
