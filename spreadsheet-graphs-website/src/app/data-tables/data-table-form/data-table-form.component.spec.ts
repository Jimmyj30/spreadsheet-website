import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableFormComponent } from './data-table-form.component';

describe('DataTableFormComponent', () => {
  let component: DataTableFormComponent;
  let fixture: ComponentFixture<DataTableFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTableFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
