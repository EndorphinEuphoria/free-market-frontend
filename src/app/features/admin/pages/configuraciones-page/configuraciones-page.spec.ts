// configuraciones-page.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ConfiguracionesPageComponent } from './configuraciones-page';
import { ConfigService, ConfigResponse, ConfigRequest } from '../../../../core/services/config-service';
import { Auth } from '../../../../core/services/auth';
import { AdminNavbar } from '../../components/admin-navbar/admin-navbar';
import { provideRouter } from '@angular/router';

const mockConfigResponse: ConfigResponse = {
  id:             1,
  commerceName:   'TestShop',
  logoUrl:        'http://img.com/logo.png',
  favicomUrl:     'http://img.com/fav.ico',
  principalFont:  'Roboto',
  primaryColor:   '#23856d',
  secondaryColor: '#252b42',
  updateDate:     '2025-01-01',
};

describe('ConfiguracionesPageComponent', () => {
  let fixture: ComponentFixture<ConfiguracionesPageComponent>;
  let component: ConfiguracionesPageComponent;
  let configMock: {
    getPublicConfig: ReturnType<typeof vi.fn>;
    updateConfig:    ReturnType<typeof vi.fn>;
    applyStyles:     ReturnType<typeof vi.fn>;
    logoUrl:         ReturnType<typeof vi.fn>;
    commerceName:    ReturnType<typeof vi.fn>;
  };
  let authMock: {
    restoreSession: ReturnType<typeof vi.fn>;
    currentUser:    ReturnType<typeof vi.fn>;
    logout:         ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    configMock = {
      getPublicConfig: vi.fn().mockReturnValue(of(mockConfigResponse)),
      updateConfig:    vi.fn().mockReturnValue(of(mockConfigResponse)),
      applyStyles:     vi.fn(),
      logoUrl:         vi.fn().mockReturnValue(''),
      commerceName:    vi.fn().mockReturnValue('TestShop'),
    };
    authMock = {
      restoreSession: vi.fn(),
      currentUser:    vi.fn().mockReturnValue(null),
      logout:         vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConfiguracionesPageComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: configMock },
        { provide: Auth,          useValue: authMock },
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(ConfiguracionesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should load config on init', () => {
      expect(component.configId()).toBe(1);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBeNull();
    });

    it('should map response to form correctly', () => {
      const f = component.form();
      expect(f.commerceName).toBe('TestShop');
      expect(f.logoUrl).toBe('http://img.com/logo.png');
      expect(f.favicomUrl).toBe('http://img.com/fav.ico');
      expect(f.principalFont).toBe('Roboto');
      expect(f.primaryColor).toBe('#23856d');
      expect(f.secondaryColor).toBe('#252b42');
    });

    it('should set previews on load', () => {
      expect(component.logoPreview()).toBe('http://img.com/logo.png');
      expect(component.faviconPreview()).toBe('http://img.com/fav.ico');
    });

    it('should call applyStyles on load', () => {
      expect(configMock.applyStyles).toHaveBeenCalled();
    });

    it('should set error on load failure', async () => {
      configMock.getPublicConfig.mockReturnValue(throwError(() => new Error('fail')));

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [ConfiguracionesPageComponent],
        providers: [
          provideRouter([]),
          { provide: ConfigService, useValue: configMock },
          { provide: Auth,          useValue: authMock },
        ]
      }).compileComponents();

      const f = TestBed.createComponent(ConfiguracionesPageComponent);
      f.detectChanges();

      expect(f.componentInstance.error()).toBe('Failed to load configuration');
      expect(f.componentInstance.loading()).toBe(false);
    });
  });

  describe('saveConfig', () => {
    it('should call updateConfig with correct payload', () => {
      component.saveConfig();
      expect(configMock.updateConfig).toHaveBeenCalledWith(1, expect.objectContaining({
        commerceName: 'TestShop'
      }));
    });

    it('should set success signal on save', () => {
      component.saveConfig();
      expect(component.success()).toBe('Settings updated successfully');
    });

    it('should call applyStyles after save', () => {
      configMock.applyStyles.mockClear();
      component.saveConfig();
      expect(configMock.applyStyles).toHaveBeenCalled();
    });

    it('should set error when commerceName is empty', () => {
      component.form.update(f => ({ ...f, commerceName: '' }));
      component.saveConfig();
      expect(component.error()).toBe('Store name cannot be empty');
      expect(configMock.updateConfig).not.toHaveBeenCalled();
    });

    it('should set error when commerceName is only whitespace', () => {
      component.form.update(f => ({ ...f, commerceName: '   ' }));
      component.saveConfig();
      expect(component.error()).toBe('Store name cannot be empty');
    });

    it('should set error on save failure', () => {
      configMock.updateConfig.mockReturnValue(throwError(() => new Error('fail')));
      component.saveConfig();
      expect(component.error()).toBe('Failed to update configuration');
    });

    it('should clear error and success before saving', () => {
      component.error.set('old error');
      component.success.set('old success');
      component.saveConfig();
      expect(component.error()).toBeNull();
    });
  });

  describe('restoreDefaults', () => {
    it('should call updateConfig with default values', () => {
      component.restoreDefaults();
      expect(configMock.updateConfig).toHaveBeenCalledWith(1, expect.objectContaining({
        commerceName:   'FreeMarket',
        principalFont:  'DM Sans',
        primaryColor:   '#2563EB',
        secondaryColor: '#1D4ED8',
      }));
    });

    it('should reset form to defaults', () => {
      component.restoreDefaults();
      expect(component.form().commerceName).toBe('FreeMarket');
      expect(component.form().primaryColor).toBe('#2563EB');
    });

    it('should clear previews', () => {
      component.restoreDefaults();
      expect(component.logoPreview()).toBeNull();
      expect(component.faviconPreview()).toBeNull();
    });

    it('should set success signal', () => {
      component.restoreDefaults();
      expect(component.success()).toBe('Style restored to defaults');
    });

    it('should not call updateConfig if configId is null', () => {
      component.configId.set(null);
      configMock.updateConfig.mockClear();
      component.restoreDefaults();
      expect(configMock.updateConfig).not.toHaveBeenCalled();
    });

    it('should set error on restore failure', () => {
      configMock.updateConfig.mockReturnValue(throwError(() => new Error('fail')));
      component.restoreDefaults();
      expect(component.error()).toBe('Failed to restore configuration');
    });
  });

  describe('clearImage', () => {
    it('should clear logo preview and form logoUrl', () => {
      component.logoPreview.set('http://img.com/logo.png');
      component.form.update(f => ({ ...f, logoUrl: 'http://img.com/logo.png' }));
      component.clearImage('logo');
      expect(component.logoPreview()).toBeNull();
      expect(component.form().logoUrl).toBe('');
    });

    it('should clear favicon preview and form favicomUrl', () => {
      component.faviconPreview.set('http://img.com/fav.ico');
      component.form.update(f => ({ ...f, favicomUrl: 'http://img.com/fav.ico' }));
      component.clearImage('favicon');
      expect(component.faviconPreview()).toBeNull();
      expect(component.form().favicomUrl).toBe('');
    });
  });

  describe('onInput', () => {
    it('should update form field on input', () => {
      component.onInput({ target: { value: 'NewName' } } as any, 'commerceName');
      expect(component.form().commerceName).toBe('NewName');
    });

    it('should update primaryColor', () => {
      component.onInput({ target: { value: '#ff0000' } } as any, 'primaryColor');
      expect(component.form().primaryColor).toBe('#ff0000');
    });
  });

  describe('drag & drop', () => {
    const mockDragEvent = (files?: File[]) => ({
      preventDefault:  vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: files
        ? { files, dropEffect: '' }
        : { files: [], getData: vi.fn().mockReturnValue('') }
    } as unknown as DragEvent);

    it('should set isDraggingLogo on dragEnter', () => {
      component.onDragEnter(mockDragEvent(), 'logo');
      expect(component.isDraggingLogo()).toBe(true);
    });

    it('should set isDraggingFavicon on dragEnter', () => {
      component.onDragEnter(mockDragEvent(), 'favicon');
      expect(component.isDraggingFavicon()).toBe(true);
    });

    it('should clear isDraggingLogo on dragLeave', () => {
      component.isDraggingLogo.set(true);
      component.onDragLeave(mockDragEvent(), 'logo');
      expect(component.isDraggingLogo()).toBe(false);
    });

    it('should clear both dragging flags on drop', () => {
      component.isDraggingLogo.set(true);
      component.isDraggingFavicon.set(true);
      component.onDrop(mockDragEvent(), 'logo');
      expect(component.isDraggingLogo()).toBe(false);
      expect(component.isDraggingFavicon()).toBe(false);
    });

    it('should set error when dropped image exceeds 2MB', () => {
      const bigFile = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.png', { type: 'image/png' });
      const event = { ...mockDragEvent([bigFile]), dataTransfer: { files: [bigFile], dropEffect: '' } } as unknown as DragEvent;
      component.onDrop(event, 'logo');
      expect(component.error()).toBe('Image cannot exceed 2MB');
    });
  });
});