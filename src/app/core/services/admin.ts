import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

export interface User {

  id: number;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  state: 'ACTIVO' | 'INACTIVO';
  rol: string
  idRol: number;
  genero:string

}

export interface Role {

  idRol: number;
  nombreRol: string;
  descripcion: string;

}
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly API_URL =
    'http://localhost:8086/api-v1/auth';

  private readonly http =
    inject(HttpClient);

  // GET ALL USERS
  getAllUsers(): Observable<User[]> {

    return this.http.get<User[]>(
      `${this.API_URL}/getall`
    );

  }

  // DELETE USER
  deleteUser(id: number) {

    return this.http.delete(
      `${this.API_URL}/delete/admin/${id}`
    );

  }

  // TOGGLE STATUS
  toggleStatus(id: number) {

    return this.http.patch(
      `${this.API_URL}/setState/${id}`,
      {}
    );

  }

  getRoles() {
 return this.http.get<Role[]>(
    `${this.API_URL}/rol/getall`
  );

}

changeRole(
  idUser: number,
  idRol: number
) {

  return this.http.patch(
    `${this.API_URL}/rol/change`,
    {
      idUser,
      idRol
    }
  );

}

  

}