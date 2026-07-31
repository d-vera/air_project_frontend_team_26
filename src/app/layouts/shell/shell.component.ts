import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <!-- Desktop Sidebar (Permanent >= md) -->
      <div class="hidden md:block shrink-0">
        <app-sidebar></app-sidebar>
      </div>

      <!-- Mobile/Tablet Backdrop & Slide-over Sidebar -->
      @if (mobileSidebarOpen()) {
        <div
          (click)="closeSidebar()"
          class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden transition-opacity"
        ></div>
        <div class="fixed inset-y-0 left-0 z-50 md:hidden animate-slide-in">
          <app-sidebar (closeSidebar)="closeSidebar()"></app-sidebar>
        </div>
      }

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

        <main class="flex-1 overflow-y-auto p-4 md:p-8">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `
})
export class ShellComponent {
  mobileSidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.mobileSidebarOpen.set(!this.mobileSidebarOpen());
  }

  closeSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }
}
