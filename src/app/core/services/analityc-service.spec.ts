import { TestBed } from '@angular/core/testing';

import { AnalitycService } from './analityc-service';

describe('AnalitycService', () => {
  let service: AnalitycService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalitycService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
