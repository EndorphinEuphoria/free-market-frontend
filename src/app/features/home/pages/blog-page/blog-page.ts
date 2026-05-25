import { Component } from '@angular/core';
import { Maintenance } from '../../components/maintenance/maintenance';

@Component({
  selector: 'app-blog',
  imports: [Maintenance],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.css',
})
export class BlogPage {}
