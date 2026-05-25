import { Component } from '@angular/core';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { UserTableComponent } from '../../components/user-table/user-table';
import { Toast } from '../../../../features/shop/components/toast/toast'; // ajusta el path
@Component({
  selector: 'app-pim-page',
  standalone: true,
  imports: [AdminNavbar, UserTableComponent, Toast],
  templateUrl: './pim-page.html',
  styleUrl: './pim-page.css'
})
export class PimPageComponent {}