import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioSelectionComponent } from './portfolio-selection.component';

describe('PortfolioSelectionComponent', () => {
  let component: PortfolioSelectionComponent;
  let fixture: ComponentFixture<PortfolioSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PortfolioSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PortfolioSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
