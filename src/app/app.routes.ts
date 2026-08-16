import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { ShellComponent } from './layouts/shell/shell.component';

export const routes: Routes = [
  // Public Auth Routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Dashboard & Profile Routes wrapped in Shell Layout
  {
    path: 'dashboard',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'preferences',
        canActivate: [authGuard],
        loadComponent: () => import('./features/preferences/preferences.component').then(m => m.PreferencesComponent)
      }
    ]
  },

  // Admin Only Routes wrapped in Shell Layout
  {
    path: 'admin',
    component: ShellComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/admin/user-detail/user-detail.component').then(m => m.UserDetailComponent)
      }
    ]
  },

  // Default Redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
