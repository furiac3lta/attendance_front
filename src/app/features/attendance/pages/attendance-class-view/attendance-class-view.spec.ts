import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceClassView } from '../attendance-class-view';

describe('AttendanceClassView', () => {
  let component: AttendanceClassView;
  let fixture: ComponentFixture<AttendanceClassView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceClassView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceClassView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
