import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface Slide {
  id: number;
  label: string;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  // TODO: Reemplazar imagen con la de ecommerce
  imageUrl: string;
  bgColor: string;
}

@Component({
  selector: 'app-hero-slider',
  imports: [NgFor],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSlider implements OnInit, OnDestroy { 
  private readonly router = inject(Router);

  currentIndex = signal(0);
  isAnimating = signal(false);

  // BACKEND: cargar slides desde API
slides: Slide[] = [
  {
    id: 1,
    label: 'SMART TVs 2025',
    title: 'NEXT GEN ENTERTAINMENT',
    description:
      'Experience ultra HD visuals,\nimmersive sound and smart connectivity.',
    ctaText: 'SHOP TVs',
    ctaLink: '/shop',
    imageUrl:
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    bgColor: '#0f172a',
  },
  {
    id: 2,
    label: 'GAMING SETUP',
    title: 'POWER YOUR PLAY',
    description:
      'High-performance gaming gear,\nmonitors and accessories for every gamer.',
    ctaText: 'EXPLORE NOW',
    ctaLink: '/shop',
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    bgColor: '#111827',
  },
  {
    id: 3,
    label: 'SMART HOME',
    title: 'CONNECTED LIVING',
    description:
      'Upgrade your lifestyle with\nsmart speakers, lighting and home devices.',
    ctaText: 'VIEW PRODUCTS',
    ctaLink: '/shop',
    imageUrl:
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
    bgColor: '#1e3a8a',
  }
];

  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;
  private readonly AUTO_PLAY_MS = 5000;

  ngOnInit(): void {
      this.startAutoPlay();
  }

  ngOnDestroy(): void {
      this.stopAutoPlay();
  }

  goTo(index: number): void {
    if (this.isAnimating() || index === this.currentIndex()) return;
    this.isAnimating.set(true);
    this.currentIndex.set(index);
    setTimeout(() => this.isAnimating.set(false), 600);
    this.restartAutoPlay();
  }

  prev(): void {
    const prev = (this.currentIndex() - 1 + this.slides.length) % this.slides.length;
    this.goTo(prev);
  }

  next(): void {
    const next = (this.currentIndex() + 1) % this.slides.length;
    this.goTo(next);
  }

  navigateTo(link: string): void {
    this.router.navigate([link]);
  }

  private startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => this.next(), this.AUTO_PLAY_MS);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  private restartAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
