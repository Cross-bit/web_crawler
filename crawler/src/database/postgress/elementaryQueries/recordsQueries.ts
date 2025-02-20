import { RecordData, RecordDataPartial, TagData} from '../../interface';
import query, { pool } from "../connection"
import { RecordCreationError } from '../../../Errors/InternalServerError';
import { PoolClient } from 'pg';
import { RecordNotFoundError } from '../../../Errors/NotFoundError';
import { createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript';


/**
 * 
 * Elementary queries for records
 * 
*/

/**
 * Returns single record by record id
 * @param client 
 * @param recordId 
 * @returns 
 */
export const getRecordByIdQuery = async (client: PoolClient, recordId: number) => {
    const qeueryRes = await client.query("SELECT * FROM records WHERE id=$1", [recordId]);

    const queriedRow = qeueryRes.rows[0];

    if (!queriedRow){
        throw new RecordNotFoundError(recordId);
    }

    const result:RecordData = {
        id: queriedRow.id,
        url: queriedRow.url,
        periodicity_min: queriedRow.periodicity_minute,
        periodicity_hour: queriedRow.periodicity_hour,
        periodicity_day: queriedRow.periodicity_day,
        label: queriedRow.label,
        boundary: queriedRow.boundary,
        active: queriedRow.active
    }; 

    return Promise.resolve(result);
}

/**
 * Returns records by record ids
 * @param client 
 * @param recordId 
 * @returns 
 */
export const getRecordsByIdsQuery = async (client: PoolClient, recordIds: number[]) => {
    const qeueryRes = await client.query("SELECT * FROM records WHERE id IN $1", [recordIds]);

    const queryRes:RecordData[] = [];

    qeueryRes.rows.forEach(queriedRow => {
        queryRes.push(
            {
                id: queriedRow.id,
                url: queriedRow.url,
                periodicity_min: queriedRow.periodicity_minute,
                periodicity_hour: queriedRow.periodicity_hour,
                periodicity_day: queriedRow.periodicity_day,
                label: queriedRow.label,
                boundary: queriedRow.boundary,
                active: queriedRow.active
            }
        );
    });

    return Promise.resolve(queryRes);
}

export const getAllRecordsQuery = async (client: PoolClient) => {
    const qeueryRes = await client.query("SELECT * FROM records");
    
    const result:RecordData[] = qeueryRes.rows.map((queryRow: any) => ({
        id: queryRow.id,
        url: queryRow.url,
        periodicity_min: queryRow.periodicity_minute,
        periodicity_hour: queryRow.periodicity_hour,
        periodicity_day: queryRow.periodicity_day,
        label: queryRow.label,
        boundary: queryRow.boundary,
        active: queryRow.active
    }));

    return Promise.resolve(result);
}

/**
 * Inserts new record into database and returns its id
 * @param client pg client object
 * @param data new record data to create
 * @returns 
 */
export const insertNewRecordQuery = async (client: PoolClient, data: RecordDataPartial) => {
    console.log("tady:");
    console.log(data);
    const createRecordQuery = {
        text: `INSERT INTO records 
        (url, periodicity_minute, periodicity_hour, periodicity_day, label, boundary, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        values: [data.url, data.periodicity_min, data.periodicity_hour, data.periodicity_day, data.label, data.boundary, data.active]
    };

    const queryRes = await client.query(createRecordQuery);
        
    if (queryRes.rowCount != 1)
        throw new RecordCreationError(data);
    
    return Promise.resolve(queryRes.rows[0].id);
}

/**
 * Deletes record data from records table
 * @param client 
 * @param recordId Id of record to delete
 * @returns result of the query
 */
export const deleteRecordQuery = async (client: PoolClient, recordId: number) => {
    const queryRemRecord = "DELETE FROM records WHERE id = $1";
    const queryRecordRes = await client.query(queryRemRecord, [recordId]);

    return queryRecordRes;
}

/**
 * Update records data in database
 * @param client 
 * @param data 
 */
export const updateWholeRecordQuery = async (client: PoolClient, data: RecordData) => {
    
    const queryUpdate = {
        text: 'UPDATE records SET url = $1, periodicity_minute = $2, periodicity_hour = $3, periodicity_day = $4, label = $5, boundary = $6, active = $7 WHERE id = $8',
        values: [data.url, data.periodicity_min, data.periodicity_hour, data.periodicity_day, data.label, data.boundary, data.active, data.id]
    };

    const queryUpdateRes = await client.query(queryUpdate);
    return queryUpdateRes;
}

/**
 * Deletes records tags relations from records_tags_relations table
 * @param client 
 * @param recordId Record id to delete tags
 * @returns result of the query
 */
export const deleteRecordTagsRelationQuery = async (client:PoolClient, recordId:number) => {
    const queryRemTagsRelations = "DELETE FROM tags_records_relations WHERE record_id = $1";
    const queryTagsRes = await client.query(queryRemTagsRelations, [recordId]);

    return queryTagsRes;
}


/**
 * Query for insertion of tags record relations to particular racord (by record id).
 * @param client pg client object
 * @param recordId recordId to cre
 * @param tagIds tag ids to insert
 * @returns list of ids of newly inserted tags records relations
 */
export const insertRecordTagsRelationQuery = async (client:PoolClient, recordId: number, tagIds: number[]):Promise<number[]> => {
    
    const createRecordQuery = {
        text: 'INSERT INTO tags_records_relations (tag_id, record_id) VALUES(unnest($1::int[]), $2) RETURNING id',
        values: [tagIds, recordId]
    };
    
    const queryRes = await client.query(createRecordQuery);

    return Promise.resolve(queryRes.rows.map(row => row.id));
}