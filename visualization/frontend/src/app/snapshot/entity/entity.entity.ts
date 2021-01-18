import { entityFilter } from '../distribution/distribution.entity';

export interface ProjectArtifactEntity {
    id: string;
    entities: {
        name: string;
        value: number;
        url: string;
        type: entityFilter;
    }[];
}

export interface ProjectEntityDto {
    project: string;
    entities: {
        name: string;
        value: number;
        url: string;
        type: entityFilter;
    }[];
}
