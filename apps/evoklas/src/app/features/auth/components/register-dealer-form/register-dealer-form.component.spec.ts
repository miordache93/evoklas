import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDealerFormComponent } from './register-dealer-form.component';

describe('RegisterDealerFormComponent', () => {
  let component: RegisterDealerFormComponent;
  let fixture: ComponentFixture<RegisterDealerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterDealerFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDealerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
