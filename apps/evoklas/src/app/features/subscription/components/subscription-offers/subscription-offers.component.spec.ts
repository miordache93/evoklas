import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionOffersComponent } from './subscription-offers.component';

describe('SubscriptionOffersComponent', () => {
  let component: SubscriptionOffersComponent;
  let fixture: ComponentFixture<SubscriptionOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubscriptionOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
