import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { SidebarComponent } from '../sidebar/sidebar';
import { AuthService } from '../../core/auth/auth';
import { AdminService } from '../../admin/admin.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayoutComponent implements OnInit {
  role: string | null = null;
  notifications: any[] = [];

  private pollSubscription: any;

  constructor(
    private auth: AuthService,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.role = this.auth.getRole();
    if (this.role === 'Admin') {
      this.loadNotifications();
      // Poll every 30 seconds
      this.pollSubscription = setInterval(() => {
        this.loadNotifications();
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      clearInterval(this.pollSubscription);
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  loadNotifications() {
    this.adminService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  markAsRead(notification: any) {
    if (!notification.isRead) {
      this.adminService.markNotificationAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
        }
      });
    }
  }

  logout() {
    this.auth.logout();
    location.href = '/login';
  }
}
