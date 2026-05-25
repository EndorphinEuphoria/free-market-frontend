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

export const REGIONES_COMUNAS: Record<string, string[]> = {
  'Arica y Parinacota': ['Arica', 'Camarones', 'Putre', 'General Lagos'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'],
  'Antofagasta': ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'],
  'Atacama': ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado'],
  'Valparaíso': ['Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero', 'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban', 'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera', 'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena', 'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay', 'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana'],
  'Región Metropolitana': ['Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Tiltil', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor'],
  'O\'Higgins': ['Rancagua', 'Codegua', 'Coinco', 'Coltauco', 'Doñihue', 'Graneros', 'Las Cabras', 'Machalí', 'Malloa', 'Mostazal', 'Olivar', 'Peumo', 'Pichidegua', 'Quinta de Tilcoco', 'Rengo', 'Requínoa', 'San Vicente', 'Pichilemu', 'La Estrella', 'Litueche', 'Marchihue', 'Navidad', 'Paredones', 'San Fernando', 'Chépica', 'Chimbarongo', 'Lolol', 'Nancagua', 'Palmilla', 'Peralillo', 'Placilla', 'Pumanque', 'Santa Cruz'],
  'Maule': ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas'],
  'Ñuble': ['Chillán', 'Bulnes', 'Chillán Viejo', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón', 'San Ignacio', 'Yungay', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil', 'Treguaco', 'Coihueco', 'Ñiquén', 'San Carlos', 'San Fabián', 'San Nicolás'],
  'Biobío': ['Concepción', 'Coronel', 'Chiguayante', 'Florida', 'Hualqui', 'Lota', 'Penco', 'San Pedro de la Paz', 'Santa Juana', 'Talcahuano', 'Tomé', 'Hualpén', 'Lebu', 'Arauco', 'Cañete', 'Contulmo', 'Curanilahue', 'Los Álamos', 'Tirúa', 'Los Ángeles', 'Antuco', 'Cabrero', 'Laja', 'Mulchén', 'Nacimiento', 'Negrete', 'Quilaco', 'Quilleco', 'San Rosendo', 'Santa Bárbara', 'Tucapel', 'Yumbel', 'Alto Biobío'],
  'La Araucanía': ['Temuco', 'Carahue', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Padre las Casas', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Cholchol', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria'],
  'Los Ríos': ['Valdivia', 'Corral', 'Futrono', 'La Unión', 'Lago Ranco', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'Río Bueno'],
  'Los Lagos': ['Puerto Montt', 'Calbuco', 'Cochamó', 'Fresia', 'Frutillar', 'Los Muermos', 'Llanquihue', 'Maullín', 'Puerto Varas', 'Castro', 'Ancud', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena'],
  'Aysén': ['Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', 'O\'Higgins', 'Tortel', 'Chile Chico', 'Río Ibáñez'],
  'Magallanes': ['Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Cabo de Hornos', 'Antártica', 'Porvenir', 'Primavera', 'Timaukel', 'Natales', 'Torres del Paine'],
};

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
  readonly regiones = Object.keys(REGIONES_COMUNAS);

  profileForm!: FormGroup;
  locationForm!: FormGroup;

  isLoadingProfile = signal(false);
  isLoadingLocation = signal(false);
  isSavedProfile = signal(false);
  isSavedLocation = signal(false);
  errorProfile = signal<string | null>(null);
  errorLocation = signal<string | null>(null);

  hasLocation = signal(false);

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
    console.log(request)
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
    const rol = this.auth.currentUser()?.rol?.rolName?.toUpperCase();
    if (rol === 'ADMIN') this.router.navigate(['/admin']);
    else if (rol === 'DELIVERY') this.router.navigate(['/delivery']);
    else this.router.navigate(['/home']);
  }

    get comunasDisponibles(): string[] {
    const region = this.locationForm?.get('region')?.value;
    return region ? (REGIONES_COMUNAS[region] ?? []) : [];
  }

  onRegionChange(): void {
    this.locationForm.get('comuna')?.setValue('');
  }

}