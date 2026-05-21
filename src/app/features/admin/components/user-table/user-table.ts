import {Component,inject,OnInit,signal,computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {AdminService,User} from '../../../../core/services/admin';
import { finalize } from 'rxjs';

@Component({selector: 'app-user-table',standalone: true,imports: [CommonModule, FormsModule],templateUrl: './user-table.html',styleUrl: './user-table.css'})

export class UserTableComponent implements OnInit {

private adminService =inject(AdminService);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  updatingUsers = signal<number[]>([]);
  filterUsername = signal('');

  filterId = signal('');

  filterStatus =
    signal<'all' | 'ACTIVO' | 'INACTIVO'>(
      'all'
    );

    isUpdating(userId: number): boolean {

  return this
    .updatingUsers()
    .includes(userId);

}
  // ─────────────────────────────
  // FILTERED USERS
  // ─────────────────────────────

  filteredUsers = computed(() => {

    return this.users().filter(u => {

      const matchUsername =
        u.username
          .toLowerCase()
          .includes(
            this.filterUsername()
              .toLowerCase()
          );

      const matchId =
        this.filterId() === '' ||
        u.id.toString()
          .includes(this.filterId());

      const matchStatus =
        this.filterStatus() === 'all' ||
        u.state === this.filterStatus();

      return (
        matchUsername &&
        matchId &&
        matchStatus
      );

    });

  });

  // ─────────────────────────────
  // INIT
  // ─────────────────────────────

  ngOnInit() {

    this.loadUsers();

  }

  // ─────────────────────────────
  // LOAD USERS
  // ─────────────────────────────

  loadUsers() {

    this.loading.set(true);


    this.error.set(null);

    this.adminService
      .getAllUsers()
      .subscribe({

        next: (data) => {

          this.users.set(data);

          this.loading.set(false);
          console.log(data);
        },

        error: () => {

          this.error.set(
            'Error al cargar usuarios'
          );

          this.loading.set(false);

        }

      });

  }

  // ─────────────────────────────
  // DELETE USER
  // ─────────────────────────────

  deleteUser(id: number) {

    if (!confirm(
      '¿Eliminar este usuario?'
    )) return;

    this.adminService
      .deleteUser(id)
      .subscribe({

        next: () => {

          this.users.update(list =>
            list.filter(u => u.id !== id)
          );

        },

        error: () => {

          alert(
            'Error al eliminar'
          );

        }

      });

  }
toggleStatus(user: User) {

  if (this.isUpdating(user.id)) {
    return;
  }

  this.updatingUsers.update(list => [
    ...list,
    user.id
  ]);

  const newStatus =
    user.state === 'ACTIVO'
      ? 'INACTIVO'
      : 'ACTIVO';

  this.adminService
    .toggleStatus(user.id)
    .pipe(
      finalize(() => {
        setTimeout(() => {

          this.updatingUsers.update(list =>
            list.filter(id => id !== user.id)
          );

        }, 10000);

      })
    )
    .subscribe({

      next: () => {

        this.users.update(list =>
          list.map(u =>
            u.id === user.id
              ? {
                  ...u,
                  state: newStatus
                }
              : u
          )
        );

      },

      error: () => {

        alert('Error al cambiar estado');

      }

    });

}
  // ─────────────────────────────
  // FILTER EVENTS
  // ─────────────────────────────

  onFilterUsername(e: Event) {

    this.filterUsername.set(
      (e.target as HTMLInputElement).value
    );

  }

  onFilterId(e: Event) {

    this.filterId.set(
      (e.target as HTMLInputElement).value
    );

  }

  onFilterStatus(e: Event) {

    this.filterStatus.set(
      (e.target as HTMLSelectElement)
        .value as any
    );

  }

}