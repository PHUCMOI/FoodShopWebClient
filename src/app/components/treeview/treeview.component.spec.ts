import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeViewComponent } from './treeview.component';

describe('TreeViewComponent', () => {
  let component: TreeViewComponent;
  let fixture: ComponentFixture<TreeViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TreeViewComponent]
    });
    fixture = TestBed.createComponent(TreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
