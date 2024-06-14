import { TestBed } from '@angular/core/testing';

import { XBlockService } from './x-block.service';

describe('XBlockService', () => {
  let service: XBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(XBlockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
