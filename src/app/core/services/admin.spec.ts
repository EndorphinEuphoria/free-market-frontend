import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import { AdminService, User, Role } from './admin';

describe('AdminService', () => {
  let service: AdminService;
  let http: HttpTestingController;

  const API_URL = 'http://localhost:8086/api-v1/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    const mockUsers: User[] = [
      {
        id: 1,
        username: 'john',
        email: 'john@test.com',
        firstname: 'John',
        lastname: 'Doe',
        state: 'ACTIVO',
        rol: 'USER',
        idRol: 2,
        genero: 'MALE'
      }
    ];

    service.getAllUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    const req = http.expectOne(`${API_URL}/getall`);

    expect(req.request.method).toBe('GET');

    req.flush(mockUsers);
  });

  it('should delete user', () => {
    service.deleteUser(1).subscribe();

    const req = http.expectOne(
      `${API_URL}/delete/admin/1`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush({});
  });

  it('should toggle status', () => {
    service.toggleStatus(1).subscribe();

    const req = http.expectOne(
      `${API_URL}/setState/1`
    );

    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({});

    req.flush({});
  });

  it('should get roles', () => {
    const mockRoles: Role[] = [
      {
        idRol: 1,
        nombreRol: 'ADMIN',
        descripcion: 'Administrator'
      }
    ];

    service.getRoles().subscribe(roles => {
      expect(roles).toEqual(mockRoles);
    });

    const req = http.expectOne(
      `${API_URL}/rol/getall`
    );

    expect(req.request.method).toBe('GET');

    req.flush(mockRoles);
  });

  it('should change role', () => {
    service.changeRole(1, 2).subscribe();

    const req = http.expectOne(
      `${API_URL}/rol/change`
    );

    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({
      idUser: 1,
      idRol: 2
    });

    req.flush({});
  });
});