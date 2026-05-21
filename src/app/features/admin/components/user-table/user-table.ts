import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, User2 } from '../../../../core/services/auth'; 

@Component({
  selector: 'app-user-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-table.html',
  styleUrl: './user-table.css'
})
export class UserTableComponent implements OnInit {
  private auth = inject(Auth); // ← era userService

  users = signal<User2[]>([]); // ← era User
  loading = signal(true);
  error = signal<string | null>(null);

  filterUsername = signal('');
  filterId = signal('');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');

  filteredUsers = computed(() => {
    return this.users().filter(u => {
      const matchUsername = u.username.toLowerCase()
        .includes(this.filterUsername().toLowerCase());
      const matchId = this.filterId() === '' ||
        u.id.toString().includes(this.filterId());
      const matchStatus = this.filterStatus() === 'all' ||
        u.status === this.filterStatus();
      return matchUsername && matchId && matchStatus;
    });
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.auth.getAllUsers().subscribe({ // ← era this.au.getAll()
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar usuarios'); this.loading.set(false); }
    });
  }

  deleteUser(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.auth.deleteUser(id).subscribe({ // ← era userService
      next: () => this.users.update(list => list.filter(u => u.id !== id)),
      error: () => alert('Error al eliminar')
    });
  }

  toggleStatus(user: User2) { // ← era User
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.auth.toggleStatus(user.id, newStatus).subscribe({ // ← era userService
      next: () => this.users.update(list =>
        list.map(u => u.id === user.id ? { ...u, status: newStatus } : u)
      ),
      error: () => alert('Error al cambiar estado')
    });
  }

  onFilterUsername(e: Event) {
    this.filterUsername.set((e.target as HTMLInputElement).value);
  }
  onFilterId(e: Event) {
    this.filterId.set((e.target as HTMLInputElement).value);
  }
  onFilterStatus(e: Event) {
    this.filterStatus.set((e.target as HTMLSelectElement).value as any);
  }
}