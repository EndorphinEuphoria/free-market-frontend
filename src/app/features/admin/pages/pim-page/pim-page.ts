import { Component } from '@angular/core';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { UserTableComponent } from '../../components/user-table/user-table';

@Component({
  selector: 'app-pim-page',
  standalone: true,
  imports: [AdminNavbar, UserTableComponent],
  templateUrl: './pim-page.html',
})
export class PimPageComponent {}