import { Injectable } from "@angular/core";
import { ProjectSnapshotStore } from './project-snapshot.store';
import { ApiService } from 'src/app/provider/api.service';
import { SnapshotDto, ProjectSnapshotEntity } from './projet-snapshot.entity';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class ProjectSnapshotService {
    constructor(
        private readonly _store: ProjectSnapshotStore,
        private readonly _apiService: ApiService) {}

    public loadSnapshotsForProject(projectId: string) {
        this._apiService.get<SnapshotDto[]>(`snapshots/${projectId}`).pipe(
            map(dtos => {
                const projectSnapshot: ProjectSnapshotEntity = {
                    snapshots: dtos
                    .sort((a, b) => a.index - b.index) // snapshots are in reverse order, sort them first by index
                    .map(x => ({
                        ...x,
                        id: x.index
                    })),
                    id: projectId
                };
                return projectSnapshot;
            })
        ).subscribe(projectSnapshots => {
            this._store.add(projectSnapshots);
        });
    }

    public clearSnapshots() {
        this._store.remove();
    }

    public updateTileWidth(newWidth: number) {
        this._store.updateTileWidth(newWidth);
    }
}
