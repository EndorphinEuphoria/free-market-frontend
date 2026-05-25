import { Component } from '@angular/core';
import { Maintenance } from '../../components/maintenance/maintenance';

@Component({
  selector: 'app-contact',
  imports: [Maintenance],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {}
