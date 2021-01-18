
export interface Snapshot {
    id: number; // the index of the snapshot
    hash: string;
    message: string;
    date: Date;
}

export interface ProjectSnapshotEntity {
    id: string; // project id
    snapshots: Snapshot [];
}

export interface SnapshotDto {
    hash: string;
    message: string;
    index: number;
    date: Date;
}
