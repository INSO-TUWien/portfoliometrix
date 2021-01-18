import { QueryEntity } from '@datorama/akita';
import { ProjectSelectionEntity } from './project-selection.entity';
import { ProjectSelectionStore, ProjectSelectionState } from './project-selection.store';
import { Injectable } from '@angular/core';
import { ProjectQuery } from 'src/app/project/project.query';
import { map, flatMap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ProjectSelectionQuery extends QueryEntity<ProjectSelectionState, ProjectSelectionEntity> {
    constructor(
        private readonly _projectQuery: ProjectQuery,
        store: ProjectSelectionStore) {
        super(store);
    }

    public projectSelections$ = this.selectAll();
    public onlySelectedProjects$ = this.selectAll({filterBy: x => x.isSelected});
}
