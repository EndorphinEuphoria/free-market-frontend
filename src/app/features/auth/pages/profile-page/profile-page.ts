import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { disabled } from '@angular/forms/signals';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);

  form!: FormGroup;
  isLoading = signal(false);
  isSaved = signal(false);
  avatarUrl = signal<string | null>(null);

ngOnInit() {
  const user = this.auth.currentUser();

  this.form = this.fb.group({
    firstName: [user?.firstName ?? '', Validators.required],
    lastName: [user?.lastName ?? '', Validators.required],
    username: [user?.username ?? '', Validators.required],
    email: [user?.email ?? '', [Validators.required, Validators.email]],
    genre: [user?.genre ?? ''],
    role: [user?.rol?.rolName ?? '', Validators.required, { disabled: true }],
    avatar: [null]
  });
}

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
      this.isSaved.set(true);
      setTimeout(() => this.isSaved.set(false), 3000);
    }, 800);
  }
}