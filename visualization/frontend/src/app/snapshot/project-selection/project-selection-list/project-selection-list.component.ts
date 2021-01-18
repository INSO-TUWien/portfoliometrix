import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ProjectSelectionQuery } from '../project-selection.query';
import { ProjectChangeEvent, ProjectSelectionEntity } from '../project-selection.entity';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-selection-list',
  templateUrl: './project-selection-list.component.html',
  styleUrls: ['./project-selection-list.component.scss']
})
export class ProjectSelectionListComponent implements OnInit {

  @Output()
  public stateChanged: EventEmitter<ProjectChangeEvent> = new EventEmitter();
  @Input()
  public projectSelections: ProjectSelectionEntity[];

  ngOnInit() {
  }
}
