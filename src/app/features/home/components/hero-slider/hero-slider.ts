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
      label: 'SUMMER 2024',
      title: 'NEW COLLECTION',
      description: 'We know how large objects will act,\nbut things on a small scale.',
      ctaText: 'SHOP NOW',
      ctaLink: '/shop',
      // BACKEND: reemplazar con imagen real del producto/campaña
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      bgColor: '#23b5d3',
    },
        {
      id: 2,
      label: 'AUTUMN 2024',
      title: 'TREND SETTERS',
      description: 'Discover the latest trends crafted\nfor the modern lifestyle.',
      ctaText: 'EXPLORE',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80',
      bgColor: '#2a9d8f',
    },
    {
      id: 3,
      label: 'WINTER 2024',
      title: 'COZY ESSENTIALS',
      description: 'Stay warm and stylish this season\nwith our curated picks.',
      ctaText: 'VIEW ALL',
      ctaLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      bgColor: '#457b9d',
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
