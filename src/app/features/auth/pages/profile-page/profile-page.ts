import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../../core/services/auth';
import { HttpClient } from '@angular/common/http';
import { LocationService, LocationResponseForId } from '../../../../core/services/location-service';

export interface UpdateRequest {
  username?: string;
  email?: string;
  genre?: string;
  password?: string;
}

export interface AddressSlot {
  key: string;
  label: string;
  icon: string;
  form: FormGroup;
  hasLocation: ReturnType<typeof signal<boolean>>;
  isLoading: ReturnType<typeof signal<boolean>>;
  isSaved: ReturnType<typeof signal<boolean>>;
  isDeleting: ReturnType<typeof signal<boolean>>;
  error: ReturnType<typeof signal<string | null>>;
  streetAddress: ReturnType<typeof signal<string>>;
  isActive: ReturnType<typeof signal<boolean>>;
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
export class ProfilePage implements OnInit {
  private fb              = inject(FormBuilder);
  private router          = inject(Router);
  protected auth            = inject(Auth);
  private locationService = inject(LocationService);
  private http            = inject(HttpClient);

  readonly regiones = Object.keys(REGIONES_COMUNAS);

  profileForm!: FormGroup;
  addressSlots: AddressSlot[] = [];

  isLoadingProfile = signal(false);
  isSavedProfile   = signal(false);
  errorProfile     = signal<string | null>(null);

  private buildSlot(key: string, label: string, icon: string): AddressSlot {
    return {
      key,
      label,
      icon,
      form: this.fb.group({
        street:       ['', Validators.required],
        streetNumber: ['', Validators.required],
        region:       ['', Validators.required],
        comuna:       ['', Validators.required],
      }),
      hasLocation:   signal(false),
      isLoading:     signal(false),
      isSaved:       signal(false),
      isDeleting:    signal(false),
      error:         signal(null),
      streetAddress: signal(''),
      isActive:      signal(false),
    };
  }

  ngOnInit(): void {
    const user = this.auth.currentUser();

    this.profileForm = this.fb.group({
      username: [user?.username ?? '', Validators.required],
      email:    ['', [Validators.email]],
      genre:    [''],
      password: [''],
    });

    this.addressSlots = [
      this.buildSlot('HOME',  'Home',  'ti-home'),
      this.buildSlot('WORK',  'Work',  'ti-building'),
      this.buildSlot('OTHER', 'Other', 'ti-map-pin'),
    ];

    if (user?.userId) {
      this.locationService.getAllLocations(user.userId).subscribe({
        next: (locations: LocationResponseForId[]) => {
          locations.forEach(loc => {
            const slot = this.addressSlots.find(s => s.key === loc.addressType);
            if (!slot) return;

            slot.hasLocation.set(true);
            slot.isActive.set(loc.active);
            slot.streetAddress.set(loc.streetAddress);
            slot.form.patchValue({ region: loc.regionNombre });

            setTimeout(() => {
              const firstPart = loc.streetAddress?.split(',')[0]?.trim() ?? '';
              const lastSpaceIndex = firstPart.lastIndexOf(' ');
              const street       = lastSpaceIndex > 0 ? firstPart.substring(0, lastSpaceIndex) : firstPart;
              const streetNumber = lastSpaceIndex > 0 ? firstPart.substring(lastSpaceIndex + 1) : '';
              slot.form.patchValue({ comuna: loc.comunaNombre, street, streetNumber });
            }, 0);
          });
        },
        error: () => {}
      });
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) return;

    this.errorProfile.set(null);
    const val  = this.profileForm.value;
    const user = this.auth.currentUser();

    const body: UpdateRequest = {};
    if (val.username && val.username !== user?.username) body.username = val.username;
    if (val.email)    body.email    = val.email;
    if (val.genre)    body.genre    = val.genre;
    if (val.password) body.password = val.password;

    if (Object.keys(body).length === 0) {
      this.isSavedProfile.set(true);
      setTimeout(() => this.isSavedProfile.set(false), 3000);
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
      error: () => {
        this.isLoadingProfile.set(false);
        this.errorProfile.set('Error updating profile.');
      }
    });
  }

  onSubmitLocation(slot: AddressSlot): void {
    if (slot.form.invalid) return;

    slot.error.set(null);
    slot.isLoading.set(true);

    const request = { ...slot.form.value, addressType: slot.key };

    const action$ = slot.hasLocation()
      ? this.locationService.updateLocation(request)
      : this.locationService.createLocation(request);

    action$.subscribe({
      next: (res) => {
        slot.isLoading.set(false);
        slot.hasLocation.set(true);
        slot.streetAddress.set(res.streetAddress);
        slot.isSaved.set(true);
        setTimeout(() => slot.isSaved.set(false), 3000);
      },
      error: () => {
        slot.isLoading.set(false);
        slot.error.set('Address not found. Please verify the information.');
      }
    });
  }

  onDeleteLocation(slot: AddressSlot): void {
    slot.isDeleting.set(true);
    this.locationService.deleteLocation(slot.key).subscribe({
      next: () => {
        slot.isDeleting.set(false);
        slot.hasLocation.set(false);
        slot.isActive.set(false);
        slot.streetAddress.set('');
        slot.form.reset();
        this.refreshActiveStates();
      },
      error: () => {
        slot.isDeleting.set(false);
        slot.error.set('Error deleting address.');
      }
    });
  }

  private refreshActiveStates(): void {
    const user = this.auth.currentUser();
    if (!user?.userId) return;
    this.locationService.getAllLocations(user.userId).subscribe({
      next: (locations) => {
        this.addressSlots.forEach(s => s.isActive.set(false));
        locations.forEach(loc => {
          const slot = this.addressSlots.find(s => s.key === loc.addressType);
          if (slot) slot.isActive.set(loc.active);
        });
      },
      error: () => {}
    });
  }

  onCancel(): void {
    const rol = this.auth.currentUser()?.rol?.rolName?.toUpperCase();
    if (rol === 'ADMIN') this.router.navigate(['/admin']);
    else if (rol === 'DELIVERY') this.router.navigate(['/delivery']);
    else this.router.navigate(['/home']);
  }

  getComunasDisponibles(slot: AddressSlot): string[] {
    const region = slot.form.get('region')?.value;
    return region ? (REGIONES_COMUNAS[region] ?? []) : [];
  }

  onRegionChange(slot: AddressSlot): void {
    slot.form.get('comuna')?.setValue('');
  }
}