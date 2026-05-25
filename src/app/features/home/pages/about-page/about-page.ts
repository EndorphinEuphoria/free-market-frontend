import { Component } from '@angular/core';
import { Maintenance } from '../../components/maintenance/maintenance';

@Component({
  selector: 'app-about-page',
  imports: [Maintenance],
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
})
export class AboutPage {}
