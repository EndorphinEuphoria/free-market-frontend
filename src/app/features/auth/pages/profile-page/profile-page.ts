import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { disabled } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';
import { LocationService } from '../../../../core/services/location-service';

export interface UpdateRequest {
  username?: string;
  email?: string;
  genre?: string;
  password?: string;
}

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
  private locationService = inject(LocationService);
  private http = inject(HttpClient)

  profileForm!: FormGroup;
  locationForm!: FormGroup;

  isLoadingProfile = signal(false);
  isLoadingLocation = signal(false);
  isSavedProfile = signal(false);
  isSavedLocation = signal(false);
  errorProfile = signal<string | null>(null);
  errorLocation = signal<string | null>(null);

  hasLocation = signal(false);
  avatarUrl = signal<string | null>(null);

  ngOnInit() {
    const user = this.auth.currentUser();

    this.profileForm = this.fb.group({
      username: [user?.username ?? '', Validators.required],
      email: ['', [Validators.email]],
      genre: [''],
      password: ['']
    });

    this.locationForm = this.fb.group({
      street: ['', Validators.required],
      streetNumber: ['', Validators.required],
      comuna: ['', Validators.required],
      region: ['', Validators.required]
    });

    if (user?.userId) {
      this.locationService.getLocation(user.userId).subscribe({
        next: (loc) => {
          this.hasLocation.set(true);
          // show only streetAdress, cause getLocation returns LocationResponseForId
          this.locationForm.patchValue({
            comuna: loc.comunaNombre,
            region: loc.regionNombre
          });
        },
        error: () => this.hasLocation.set(false)
      });
    }
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmitProfile(): void {
    this.errorProfile.set(null);
    const val = this.profileForm.value;
    const user = this.auth.currentUser();

    const body: UpdateRequest = {};
    if (val.username && val.username !== user?.username) body.username = val.username;
    if (val.email) body.email = val.email;
    if (val.genre) body.genre = val.genre;
    if (val.password) body.password = val.password;

    if (Object.keys(body).length === 0) {
      this.isSavedProfile.set(true);
      setTimeout(() => this.isLoadingProfile.set(false), 3000);
      return;
    }

    this.isLoadingProfile.set(true);
    this.http.patch('http://localhost:8086/api-v1/auth/update', body, {
      headers: { 'X-User-Id': String(user?.userId) }
    }).subscribe({
      next: () => {
        this.isLoadingProfile.set(false);
        this.isSavedProfile.set(true);
        setTimeout(() => this.isSavedProfile.set(false), 3000);
      },
      error: (err) => {
        this.isLoadingProfile.set(false);
        this.errorProfile.set('Error updating profile.');
      }
    });
  }

  onSubmitLocation(): void {
    if (this.locationForm.invalid) return;
    this.errorLocation.set(null);
    this.isLoadingLocation.set(true);

    const request = this.locationForm.value;
    const action$ = this.hasLocation()
      ? this.locationService.updateLocation(request)
      : this.locationService.createLocation(request);

    action$.subscribe({
      next: () => {
        this.isLoadingLocation.set(false);
        this.hasLocation.set(true);
        this.isSavedLocation.set(true);
        setTimeout(() => this.isSavedLocation.set(false), 3000);
      },
      error: (err) => {
        this.isLoadingLocation.set(false);
        this.errorLocation.set('Address not found. Please verify the entered information.');
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

}