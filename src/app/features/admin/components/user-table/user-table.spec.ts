// user-table.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UserTableComponent } from './user-table';
import { AdminService, User, Role } from '../../../../core/services/admin';
import { ToastService } from '../../../../core/services/toast-service';

const mockRoles: Role[] = [
  { idRol: 1, nombreRol: 'ADMIN', descripcion: 'ADMIN ROL' },
  { idRol: 2, nombreRol: 'USER', descripcion: 'USER ROL' },
  { idRol: 3, nombreRol: 'DELIVERY', descripcion: 'DELIVERY ROL' },
];

const mockUsers: User[] = [
  { id: 1, username: 'admin',   firstname: 'Super', lastname: 'Admin',  email: 'admin@test.com',   state: 'ACTIVO',   idRol: 1, rol: 'ADMIN', genero: 'MASCULINO' },
  { id: 2, username: 'alice',   firstname: 'Alice', lastname: 'Smith',  email: 'alice@test.com',   state: 'ACTIVO',   idRol: 2, rol: 'USER', genero: 'FEMENINO'},
  { id: 3, username: 'bob',     firstname: 'Bob',   lastname: 'Jones',  email: 'bob@test.com',     state: 'INACTIVO', idRol: 2, rol: 'USER', genero: 'MASCULINO'},
  { id: 4, username: 'carlos',  firstname: 'Carlos',lastname: 'Ruiz',   email: 'carlos@test.com',  state: 'ACTIVO',   idRol: 3, rol: 'DELIVERY', genero: 'NON-BINARY'},
];

describe('UserTableComponent', () => {
  let fixture: ComponentFixture<UserTableComponent>;
  let component: UserTableComponent;
  let adminMock: {
    getAllUsers:  ReturnType<typeof vi.fn>;
    getRoles:     ReturnType<typeof vi.fn>;
    deleteUser:   ReturnType<typeof vi.fn>;
    toggleStatus: ReturnType<typeof vi.fn>;
    changeRole:   ReturnType<typeof vi.fn>;
  };
  let toastMock: {
    confirm: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    error:   ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    adminMock = {
      getAllUsers:  vi.fn().mockReturnValue(of(mockUsers)),
      getRoles:     vi.fn().mockReturnValue(of(mockRoles)),
      deleteUser:   vi.fn().mockReturnValue(of(void 0)),
      toggleStatus: vi.fn().mockReturnValue(of(void 0)),
      changeRole:   vi.fn().mockReturnValue(of(void 0)),
    };
    toastMock = {
      confirm: vi.fn().mockResolvedValue(true),
      success: vi.fn(),
      error:   vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserTableComponent],
      providers: [
        { provide: AdminService, useValue: adminMock },
        { provide: ToastService, useValue: toastMock },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(UserTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should load users and roles on init', () => {
      expect(component.users()).toEqual(mockUsers);
      expect(component.roles()).toEqual(mockRoles);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should set error on load failure', async () => {
      adminMock.getAllUsers.mockReturnValue(throwError(() => new Error('fail')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [UserTableComponent],
        providers: [
          { provide: AdminService, useValue: adminMock },
          { provide: ToastService, useValue: toastMock },
        ]
      }).compileComponents();

      const f = TestBed.createComponent(UserTableComponent);
      f.detectChanges();

      expect(f.componentInstance.error()).toBe('Error al cargar usuarios');
      expect(f.componentInstance.loading()).toBe(false);
    });
  });

  describe('filtering', () => {
    it('should filter by username', () => {
      component.filterUsername.set('alice');
      expect(component.filteredUsers().length).toBe(1);
      expect(component.filteredUsers()[0].username).toBe('alice');
    });

    it('should filter by id', () => {
      component.filterId.set('3');
      expect(component.filteredUsers().every(u => u.id.toString().includes('3'))).toBe(true);
    });

    it('should filter by ACTIVO status', () => {
      component.filterStatus.set('ACTIVO');
      expect(component.filteredUsers().every(u => u.state === 'ACTIVO')).toBe(true);
    });

    it('should filter by INACTIVO status', () => {
      component.filterStatus.set('INACTIVO');
      expect(component.filteredUsers().every(u => u.state === 'INACTIVO')).toBe(true);
    });

    it('should show all when filter is all', () => {
      component.filterStatus.set('all');
      expect(component.filteredUsers().length).toBe(mockUsers.length);
    });

    it('should reset page to 1 on filter change', () => {
      component.page.set(2);
      component.onFilterUsername({ target: { value: 'alice' } } as any);
      expect(component.page()).toBe(1);
    });

    it('should be case-insensitive for username filter', () => {
      component.filterUsername.set('ALICE');
      expect(component.filteredUsers().length).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should start on page 1', () => expect(component.page()).toBe(1));

    it('should not go below page 1', () => {
      component.prevPage();
      expect(component.page()).toBe(1);
    });

    it('should not exceed totalPages', () => {
      component.nextPage();
      expect(component.page()).toBe(1);
    });

    it('should paginate correctly with more than pageSize items', () => {
      const many: User[] = Array.from({ length: 25 }, (_, i) => ({
        id: i + 10, username: `user${i}`, firstname: 'A', lastname: 'B',
        email: `u${i}@test.com`, state: 'ACTIVO', idRol: 2, rol: 'USER', genero: 'MASCULINO'
        }));
      component.users.set(many);

      expect(component.totalPages()).toBe(3);
      expect(component.pagedUsers().length).toBe(10);

      component.nextPage();
      expect(component.page()).toBe(2);

      component.prevPage();
      expect(component.page()).toBe(1);
    });
  });

  describe('isProtectedUser', () => {
    it('should return true for user with id 1', () => {
      expect(component.isProtectedUser(mockUsers[0])).toBe(true);
    });

    it('should return false for other users', () => {
      expect(component.isProtectedUser(mockUsers[1])).toBe(false);
    });
  });

  describe('isUpdating / isUpdatingRole', () => {
    it('should return false initially', () => {
      expect(component.isUpdating(2)).toBe(false);
      expect(component.isUpdatingRole(2)).toBe(false);
    });

    it('should return true while in updatingUsers list', () => {
      component.updatingUsers.set([2]);
      expect(component.isUpdating(2)).toBe(true);
    });

    it('should return true while in updatingRoles list', () => {
      component.updatingRoles.set([2]);
      expect(component.isUpdatingRole(2)).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should remove user from list after delete', async () => {
      await component.deleteUser(2);
      expect(component.users().find(u => u.id === 2)).toBeUndefined();
      expect(toastMock.success).toHaveBeenCalledWith('User deleted successfully');
    });

    it('should not delete if confirm returns false', async () => {
      toastMock.confirm.mockResolvedValue(false);
      await component.deleteUser(2);
      expect(adminMock.deleteUser).not.toHaveBeenCalled();
    });

    it('should show error toast on delete failure', async () => {
      adminMock.deleteUser.mockReturnValue(throwError(() => new Error('fail')));
      await component.deleteUser(2);
      expect(toastMock.error).toHaveBeenCalledWith('Error deleting user');
    });
  });

  describe('toggleStatus', () => {
    it('should toggle ACTIVO to INACTIVO', () => {
      const user = mockUsers[1];
      component.toggleStatus(user);
      expect(component.users().find(u => u.id === user.id)?.state).toBe('INACTIVO');
      expect(toastMock.success).toHaveBeenCalledWith('User deactivated successfully');
    });

    it('should toggle INACTIVO to ACTIVO', () => {
      const user = mockUsers[2];
      component.toggleStatus(user);
      expect(component.users().find(u => u.id === user.id)?.state).toBe('ACTIVO');
      expect(toastMock.success).toHaveBeenCalledWith('User activated successfully');
    });

    it('should not toggle if already updating', () => {
      component.updatingUsers.set([2]);
      component.toggleStatus(mockUsers[1]);
      expect(adminMock.toggleStatus).not.toHaveBeenCalled();
    });

    it('should show error toast on toggle failure', () => {
      adminMock.toggleStatus.mockReturnValue(throwError(() => new Error('fail')));
      component.toggleStatus(mockUsers[1]);
      expect(toastMock.error).toHaveBeenCalledWith('Error changing status');
    });
  });

  describe('onRoleSelect / saveRole / changeRole', () => {
    it('should set pending role when a different role is selected', () => {
      component.onRoleSelect(mockUsers[1], 3);
      expect(component.getPendingRole(mockUsers[1].id)).toBe(3);
    });

    it('should clear pending role when same role is selected', () => {
      component.onRoleSelect(mockUsers[1], mockUsers[1].idRol);
      expect(component.getPendingRole(mockUsers[1].id)).toBeNull();
    });

    it('should call changeRole and clear pending on saveRole', () => {
      component.onRoleSelect(mockUsers[1], 3);
      component.saveRole(mockUsers[1]);
      expect(adminMock.changeRole).toHaveBeenCalledWith(mockUsers[1].id, 3);
      expect(component.getPendingRole(mockUsers[1].id)).toBeNull();
    });

    it('should not call changeRole if no pending role', () => {
      component.saveRole(mockUsers[1]);
      expect(adminMock.changeRole).not.toHaveBeenCalled();
    });

    it('should update user rol after changeRole success', () => {
      component.changeRole(mockUsers[1], 3);
      const updated = component.users().find(u => u.id === mockUsers[1].id);
      expect(updated?.idRol).toBe(3);
      expect(updated?.rol).toBe('DELIVERY');
    });

    it('should show error toast on changeRole failure', () => {
      adminMock.changeRole.mockReturnValue(throwError(() => new Error('fail')));
      component.changeRole(mockUsers[1], 3);
      expect(toastMock.error).toHaveBeenCalledWith('Error changing role');
    });

    it('should not changeRole if already updating role', () => {
      component.updatingRoles.set([2]);
      component.changeRole(mockUsers[1], 3);
      expect(adminMock.changeRole).not.toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should render table', () => {
      expect(fixture.nativeElement.querySelector('.pim-table')).toBeTruthy();
    });

    it('should render correct number of rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows.length).toBe(mockUsers.length);
    });

    it('should show empty message when no users match filter', () => {
      component.filterUsername.set('zzznomatch');
      fixture.detectChanges();
      const empty = fixture.nativeElement.querySelector('.pim-empty');
      expect(empty?.textContent?.trim()).toBe('No users found');
    });
  });
});