import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthEmailComponent } from './auth-email.component';

describe('AuthEmailComponent', () => {
  let component: AuthEmailComponent;
  let fixture: ComponentFixture<AuthEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthEmailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
