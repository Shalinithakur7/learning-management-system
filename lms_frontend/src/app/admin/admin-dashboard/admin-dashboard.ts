import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
    stats = {
        totalUsers: 0,
        totalInstructors: 0,
        totalStudents: 0,
        totalCourses: 0,
        activeCourses: 0,
        pendingApprovals: 0
    };

    loading = true;

    cards = [
        {
            title: 'Total Users',
            value: 0,
            icon: 'people',
            color: 'primary',
            route: '/admin/users'
        },
        {
            title: 'Total Instructors',
            value: 0,
            icon: 'school',
            color: 'accent',
            route: '/admin/users',
            queryParams: { role: 'Instructor' }
        },
        {
            title: 'Total Students',
            value: 0,
            icon: 'person',
            color: 'primary',
            route: '/admin/users',
            queryParams: { role: 'Student' }
        },
        {
            title: 'Total Courses',
            value: 0,
            icon: 'menu_book',
            color: 'accent',
            route: '/admin/courses'
        },
        {
            title: 'Active Courses',
            value: 0,
            icon: 'check_circle',
            color: 'primary',
            route: '/admin/courses',
            queryParams: { status: 'Approved' }
        },
        {
            title: 'Pending Approvals',
            value: 0,
            icon: 'pending',
            color: 'warn',
            route: '/admin/courses',
            queryParams: { status: 'Pending' }
        }
    ];

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.loading = false;
    }

    updateCardValues() {
        // Recreate the cards array to trigger change detection
        this.cards = [
            {
                title: 'Total Users',
                value: this.stats.totalUsers,
                icon: 'people',
                color: 'primary',
                route: '/admin/users'
            },
            {
                title: 'Total Instructors',
                value: this.stats.totalInstructors,
                icon: 'school',
                color: 'accent',
                route: '/admin/users',
                queryParams: { role: 'Instructor' }
            },
            {
                title: 'Total Students',
                value: this.stats.totalStudents,
                icon: 'person',
                color: 'primary',
                route: '/admin/users',
                queryParams: { role: 'Student' }
            },
            {
                title: 'Total Courses',
                value: this.stats.totalCourses,
                icon: 'menu_book',
                color: 'accent',
                route: '/admin/courses'
            },
            {
                title: 'Active Courses',
                value: this.stats.activeCourses,
                icon: 'check_circle',
                color: 'primary',
                route: '/admin/courses',
                queryParams: { status: 'Approved' }
            },
            {
                title: 'Pending Approvals',
                value: this.stats.pendingApprovals,
                icon: 'pending',
                color: 'warn',
                route: '/admin/courses',
                queryParams: { status: 'Pending' }
            }
        ];
    }

    navigateToCard(card: any) {
        if (card.queryParams) {
            this.router.navigate([card.route], { queryParams: card.queryParams });
        } else {
            this.router.navigate([card.route]);
        }
    }
}
