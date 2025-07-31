import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeredasDialog } from './veredas-dialog';

describe('VeredasDialog', () => {
  let component: VeredasDialog;
  let fixture: ComponentFixture<VeredasDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeredasDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeredasDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
