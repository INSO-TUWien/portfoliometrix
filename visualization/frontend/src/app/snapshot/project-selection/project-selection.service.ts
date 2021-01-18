import { ProjectQuery } from 'src/app/project/project.query';
import { filter } from 'rxjs/operators';
import { ProjectSelectionStore } from './project-selection.store';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectSelectionService {
    constructor(
        private readonly _store: ProjectSelectionStore,
        private readonly _projectQuery: ProjectQuery) { }

    public loadProjectSelections() {
        this._projectQuery.selectAll().pipe(
            filter(x => x.length > 0))
            .subscribe(
                projects => {
                    this._store.set(projects.map((p, i) => ({
                        id: p.id,
                        name: p.name,
                        htmlUrl: p.htmlUrl,
                        homePage: p.homePage,
                        isSelected: i === 0  // only select the first project in the list
                    }))
                    );
                }
            );
    }

    public changeSelection(id: string, isSelected: boolean) {
        this._store.update(id, ({
            isSelected
        }));
    }
}
