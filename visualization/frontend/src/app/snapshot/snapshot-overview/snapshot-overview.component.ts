import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/project/project.service';

@Component({
  selector: 'app-snapshot-overview',
  templateUrl: './snapshot-overview.component.html',
  styleUrls: ['./snapshot-overview.component.scss']
})
export class SnapshotOverviewComponent implements OnInit {

  constructor(
    // reference is necessary to instantiate service
    private readonly _projectService: ProjectService) { }

  ngOnInit() {
  }

}
