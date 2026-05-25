import { Component } from '@angular/core';
import { HeroSlider } from '../../components/hero-slider/hero-slider'; 

@Component({
  selector: 'app-home-page',
  imports: [HeroSlider],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
