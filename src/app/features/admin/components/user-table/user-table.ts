import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, User, Role } from '../../../../core/services/admin';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css'
})
export class UserTableComponent implements OnInit {

  private adminService = inject(AdminService);

  // ─── Estado ───────────────────────────────────────────────
  users        = signal<User[]>([]);
  roles        = signal<Role[]>([]);
  loading      = signal(true);
  error        = signal<string | null>(null);

  // ─── Filtros ──────────────────────────────────────────────
  filterUsername = signal('');
  filterId       = signal('');
  filterStatus   = signal<'all' | 'ACTIVO' | 'INACTIVO'>('all');

  // ─── Paginación ───────────────────────────────────────────
  page     = signal(1);
  pageSize = signal(10);

  // ─── Actualizando ─────────────────────────────────────────
  updatingUsers = signal<number[]>([]);
  updatingRoles = signal<number[]>([]);
  pendingRoles  = signal<Record<number, number>>({});

  // ─── Computeds ────────────────────────────────────────────
  filteredUsers = computed(() => {
    return this.users().filter(u => {

      const matchUsername = u.username
        .toLowerCase()
        .includes(this.filterUsername().toLowerCase());

      const matchId = this.filterId() === '' ||
        u.id.toString().includes(this.filterId());

      const matchStatus = this.filterStatus() === 'all' ||
        u.state === this.filterStatus();

      return matchUsername && matchId && matchStatus;
    });
  });

  pagedUsers = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredUsers().length / this.pageSize())
  );

  // ─── Init ─────────────────────────────────────────────────
  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  // ─── Carga ────────────────────────────────────────────────
  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  loadRoles() {
  this.adminService.getRoles().subscribe({
    next: data => {
      console.log('roles:', data);
      this.roles.set(data);
    },
    error: () => console.error('Error cargando roles')
  });
}

  // ─── Filtros ──────────────────────────────────────────────
  onFilterUsername(e: Event) {
    this.filterUsername.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onFilterId(e: Event) {
    this.filterId.set((e.target as HTMLInputElement).value);
    this.page.set(1);
  }

  onFilterStatus(e: Event) {
    this.filterStatus.set((e.target as HTMLSelectElement).value as any);
    this.page.set(1);
  }

  // ─── Paginación ───────────────────────────────────────────
  prevPage() { if (this.page() > 1) this.page.update(p => p - 1); }
  nextPage() { if (this.page() < this.totalPages()) this.page.update(p => p + 1); }

  // ─── Helpers ──────────────────────────────────────────────
  isProtectedUser(user: User): boolean { return user.id === 1; }
  isUpdating(userId: number): boolean  { return this.updatingUsers().includes(userId); }
  isUpdatingRole(userId: number): boolean { return this.updatingRoles().includes(userId); }
  getPendingRole(userId: number): number | null { return this.pendingRoles()[userId] ?? null; }

  // ─── Acciones ─────────────────────────────────────────────
  deleteUser(id: number) {
  if (!confirm('Delete this user?')) return;
  this.adminService.deleteUser(id).subscribe({
    next: () => this.users.update(list => list.filter(u => u.id !== id)),
    error: () => alert('Error deleting user')
  });
}

  toggleStatus(user: User) {
    if (this.isUpdating(user.id)) return;

    this.updatingUsers.update(list => [...list, user.id]);

    const newStatus = user.state === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    this.adminService.toggleStatus(user.id).pipe(
      finalize(() => {
        setTimeout(() => {
          this.updatingUsers.update(list => list.filter(id => id !== user.id));
        }, 3000);
      })
    ).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, state: newStatus } : u)
        );
      },
      error: () => alert('Error changing status')
    });
  }

  onRoleSelect(user: User, roleId: number) {
    if (roleId === user.idRol) {
      this.pendingRoles.update(p => {
        const copy = { ...p };
        delete copy[user.id];
        return copy;
      });
      return;
    }
    this.pendingRoles.update(p => ({ ...p, [user.id]: roleId }));
  }

  saveRole(user: User) {
    const roleId = this.getPendingRole(user.id);
    if (roleId === null) return;

    this.changeRole(user, roleId);

    this.pendingRoles.update(p => {
      const copy = { ...p };
      delete copy[user.id];
      return copy;
    });
  }

  changeRole(user: User, roleId: number) {
    if (this.isUpdatingRole(user.id)) return;

    this.updatingRoles.update(list => [...list, user.id]);

    this.adminService.changeRole(user.id, roleId).pipe(
      finalize(() => {
        setTimeout(() => {
          this.updatingRoles.update(list => list.filter(id => id !== user.id));
        }, 3000);
      })
    ).subscribe({
      next: () => {
        const selectedRole = this.roles().find(r => r.idRol === roleId);
        this.users.update(list =>
          list.map(u => u.id === user.id
            ? { ...u, idRol: roleId, rol: selectedRole?.nombreRol ?? u.rol }
            : u
          )
        );
      },
      error: () => alert('Error changing role')
    });
  }
}