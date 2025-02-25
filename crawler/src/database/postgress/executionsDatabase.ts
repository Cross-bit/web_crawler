import  { pool } from './connection'
import { DbErrorMessage } from '../../Errors/DatabaseErrors/DatabaseError'
import {ExecutionData, ExecutionDataWithRecord, ExecutionsDataFilter} from '../interface';
import { executionState } from '../../utils/enums';
import { createNewExecutionQuery, getAllExecutionsWithRecords, getExecutionsQuery, updateExecutionStateQuery,updateExecutionDurationQuery, updateExecutionRealStartQuery, updateExecutionSequenceNumberQuery } from './elementaryQueries/executionsQueries';
import { getRecordByIdQuery, getRecordsByIdsQuery } from './elementaryQueries/recordsQueries';
import { ExcuteTransaction } from './connection';
import { PoolClient } from 'pg';


////////////////////////////////
//          GETTERS           //
////////////////////////////////

export const GetExecutions = async (filter?: ExecutionsDataFilter): Promise<ExecutionData[]> => {
    return await ExcuteTransaction(async (client: PoolClient) => {
      return await getExecutionsQuery(client, filter);

    }, DbErrorMessage.RetreivalError);
}

/*export const GetLastExecution = async (filter?: ExecutionsDataFilter): Promise<ExecutionData[]> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    return await getExecutionsQuery(client, filter);

  }, DbErrorMessage.RetreivalError);
}*/

export const GetExecutionsWithRecord = async (filter?: ExecutionsDataFilter): Promise<ExecutionDataWithRecord[]> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
      const executions: ExecutionDataWithRecord[] = await getAllExecutionsWithRecords(client, filter);
      return executions;

  }, DbErrorMessage.RetreivalError);
}

////////////////////////////////
//         INSERTIONS         //
////////////////////////////////

export const insertExecution = async (execution: ExecutionData) : Promise<number> => {
  return await ExcuteTransaction(async (client:PoolClient) => {
    return await createNewExecutionQuery(client, execution);

  }, DbErrorMessage.InsertionError);
}

////////////////////////////////
//           UPDATES          //
////////////////////////////////


export const UpdateExecutionsState = async (newExecutionState: string, filter: ExecutionsDataFilter): Promise<ExecutionDataWithRecord[]> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    const updatedIds = await updateExecutionStateQuery(client, newExecutionState, filter);
    return await getAllExecutionsWithRecords(client, {executionIDs: updatedIds});
  }, DbErrorMessage.UpdateError);
}

export const UpdateExecutionsDuration = async (newExecutionState: number, filter: ExecutionsDataFilter): Promise<number[]> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    const updatedIds = await updateExecutionDurationQuery(client, newExecutionState, filter);
    return updatedIds;
  }, DbErrorMessage.UpdateError);
}

export const UpdateExecutionsRealStartTime = async (newExecutionStartTime: Date, executionId: number): Promise<void> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    await updateExecutionRealStartQuery(client, newExecutionStartTime, executionId);
  }, DbErrorMessage.UpdateError);
}

export const UpdateExecutionsSequenceNumber = async (sequenceNumber: number, executionId: number): Promise<void> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    await updateExecutionSequenceNumberQuery(client, sequenceNumber, executionId);
  }, DbErrorMessage.UpdateError);
}

export const UpdateExecutionOnExecutionStart = async (newExecutionStartTime: Date, executionId: number): Promise<void> => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    const sequenceNumber =  newExecutionStartTime.getTime();
    console.log(sequenceNumber);
    await updateExecutionRealStartQuery(client, newExecutionStartTime, executionId);
    await updateExecutionSequenceNumberQuery(client, sequenceNumber, executionId);
  }, DbErrorMessage.UpdateError);
}


/*export const UpdateExecutionState = async (newExecutionState: string, filter: ExecutionsDataFilter) => {
  return await ExcuteTransaction(async (client: PoolClient) => {
    await updateExecutionQuery(client, newExecutionState, filter);
  }, DbErrorMessage.UpdateError);
}*/