
export type entityFilter = 'file'|'class'|'method';

/**
 * use cases:
 * 1. request the distribution for all projects, an entity filter and a selected metric for a given snapshot
 * 2. Change the filter for all projects -> request new distributions for all projects
 * 3. Change the metric for all projects: start the request for all projects and replace all entries in the database
 */

/** stores the distribution values for a specific project */
export interface DistributionForProject {
    project: string;
    series: {
        name: string;
        value: number;
    }[];
}

/** stores the distribution for all projects for the given snapshot */
export interface DistributionPerSnapshotEntity {
    id: number; // the snapshot index is the id of this distribution
    metric: string;
    distributionsPerProject: DistributionForProject[];
}

export interface DistributionDto {
    snapshot: number;
    // metric: string;
    // filter: string;
    projects: {
        id: string;
        values: {
            name: string;
            value: number;
        }[]
    }[];
}
