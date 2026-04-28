import { Component } from '@angular/core';
import { Navbar } from '../components/navbar/navbar';
import { HeroSlider } from '../components/hero-slider/hero-slider';

@Component({
  selector: 'app-home-page',
  imports: [Navbar, HeroSlider],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {}
