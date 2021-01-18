import { HealthState } from 'src/app/health-state/health-state.entity';

export interface ProjectHealth {
    projectId: string;
    health: HealthState;
    violations: string[]; // name of the metrics which are violating their thresholds
}

export interface SnapshotHealthEntity {
    id: number; // the snapshot index
    projectHealthStates: ProjectHealth[];
}

export interface SnapshotHealthDto {
    index: number;
    projects: {
        projectId: string;
        health: HealthState;
        violations: string[]
    }[];
}


