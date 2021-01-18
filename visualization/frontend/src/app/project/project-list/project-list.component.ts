import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ProjectQuery } from '../project.query';
import { ProjectService } from '../project.service';
import { Observable } from 'rxjs';
import { ProjectEntity } from '../project.entity';
import { ResizedEvent } from 'angular-resize-event';
import { sorting } from '../project.store';


@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent implements OnInit {

  @Input()
  public projects$: Observable<ProjectEntity[]>;
  @Input()
  public currentSortOrder$: Observable<sorting>;
  @Output()
  public changeSortOrder: EventEmitter<sorting> = new EventEmitter();
  constructor(
    // reference to project service is necessary,
    // otherwise tree shaking would remove service
    // as it is not called directly
    private readonly _projectService: ProjectService) { }
  ngOnInit() {}

  onProjectTileResized(resizeEvent: ResizedEvent) {
    if (resizeEvent.newWidth !== resizeEvent.oldWidth) {
      this._projectService.updateTileWidth(resizeEvent.newWidth);
    }
  }
}
