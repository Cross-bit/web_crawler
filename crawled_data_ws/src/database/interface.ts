export interface ExecutionNode
{
    id: number
    title: string
    url: string
    crawlTime: number
    recordId: number
    errors: string[]
}

export interface ExecutionNodeWithExeId extends ExecutionNode {
    lastExecutionId: number
}

export interface ExecutionNodeConnection {
    id: number
    NodeIdFrom: number
    NodeIdTo: number
}

export interface ExecutionNodeConnectionWithExeId extends ExecutionNodeConnection {
    lastExecutionId: number
}


// Records interfaces
 
export interface RecordData {
    id: number
    url: string
    periodicity_min: number,
    periodicity_hour: number,
    periodicity_day: number,
    label: string
    boundary: string
    active: boolean
}

export interface TagData {
    id: number
    name: string
    color: string
}

export interface RecordDataWithTags extends RecordData {
    tags: TagData[]
}

export interface ExecutionData {
    id?: number
    creation: Date
    executionStart: Date | null // can be null until the execution starts
    realExecutionStart: Date | null
    executionDuration: number
    sequenceNumber: number
    state: string
    isTimed: boolean
    recordId: number
}

export interface ExecutionNodeWithExecution extends ExecutionNode {
    lastExecution: ExecutionData
}

export interface ExecutionNodeConnectionWithExecution extends ExecutionNodeConnection {
    lastExecution: ExecutionData
}
