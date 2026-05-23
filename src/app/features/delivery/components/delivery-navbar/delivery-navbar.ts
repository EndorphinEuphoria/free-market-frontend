import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { ConfigService } from '../../../../core/services/config-service';

@Component({
  selector: 'app-delivery-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './delivery-navbar.html',
  styleUrl: './delivery-navbar.css'
})
export class DeliveryNavbar {
  auth          = inject(Auth);
  configService = inject(ConfigService);
}