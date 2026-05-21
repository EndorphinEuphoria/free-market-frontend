import { Component } from '@angular/core';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { ReservaTableComponent } from '../../components/reserva-table/reserva-table';
import { DeliveriesTableComponent } from '../../components/deliveries-table/deliveries-table';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [AdminNavbar, ReservaTableComponent, DeliveriesTableComponent],
  templateUrl: './analitycs-page.html',
  styleUrl: './analitycs-page.css'
})
export class AnalyticsPageComponent {}