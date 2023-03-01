//import { getSdk, GetRecordQueryVariables,AllRecordsQuery, UpdateRecordRelationsByRecordIdsMutation, InsertTagsRecordRelationsMutation, InsertRecordMutation, UpdateRecordMutation } from './graphql/generated'
import { RecordData, RecordDataPartial } from '../interface';
import {RecordNotFoundError} from '../../Errors/NotFoundError'
import query, { ExcuteTransaction, pool } from "./connection"
import {defaultDatabaseErrorHandler} from "./utils"
import { DbErrorMessage } from '../../Errors/DatabaseErrors/DatabaseError';
import { deleteRecordTagsRelationQuery, insertRecordTagsRelationQuery, deleteRecordQuery, updateWholeRecordQuery, insertNewRecordQuery } from  "./elementaryQueries/recordsQueries"
import { PoolClient } from 'pg';


////////////////////////////////
//          GETTERS           //
////////////////////////////////

/**
 * @openapi
 * components:
 *   schemas:
 *     Record:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         url:
 *           type: string
 *           example: http://www.example.com
 *         boundary:
 *           type: string
 *           example: /example.com/
 *         periodicity:
 *           type: number
 *           example: 60
 *         label:
 *           type: string
 *           example: Example
 *         active:
 *           type: bool
 *           example: true
 */
export const getAllRecords = async () : Promise<RecordData[]> => {
    try 
    {
        const qeueryRes = await query("SELECT * FROM records");
    
        const result = qeueryRes.rows.map((queryRow: any) => ({
            id: queryRow.id,
            url: queryRow.url,
            periodicity: queryRow.periodicity,
            label: queryRow.label,
            boundary: queryRow.boundary,
            active: queryRow.active
        }));

        return Promise.resolve(result);
        
    }
    catch (err)  {
        defaultDatabaseErrorHandler(err as Error, DbErrorMessage.RetreivalError);
        return Promise.reject(err)
    }
}

export const getRecord = async (recordId: number) : Promise<RecordData> => {

    return await ExcuteTransaction<RecordData>(async (client:PoolClient) => {

        console.log(client)

        const qeueryRes = await query("SELECT * FROM records WHERE id=$1", [recordId]);

        const queriedRow = qeueryRes.rows[0];
        console.log(queriedRow);

        if (!queriedRow){
            throw new RecordNotFoundError(recordId);
        }

        const result = {
            id: queriedRow.id,
            url: queriedRow.url,
            periodicity: queriedRow.periodicity,
            label: queriedRow.label,
            boundary: queriedRow.boundary,
            active: queriedRow.active
        }; 
    
        return result;

    }, DbErrorMessage.RetreivalError)
}

////////////////////////////////
//         INSERTIONS         //
////////////////////////////////

/**
 * Inserts new record into the database. Returns newly created records id.  
 * @param data 
 * @returns Newly created records id(if success). 
 */
export const insertNewRecord = async (data: RecordDataPartial): Promise<number> => {

    return await ExcuteTransaction<number>(async (client:PoolClient) => {
        // TODO: return also tags relation ids??
        
        const newRecordId = await insertNewRecordQuery(client, data);
        const newRecordTags = await insertRecordTagsRelationQuery(client, newRecordId, data.tags as number[]);
        return newRecordId;

    }, DbErrorMessage.InsertionError)
}


export const insertNewRecordsTagsRelations = async (recordId: number, tagIds: number[]): Promise<void>  => {

    const client = await pool.connect();

    try  {
        client.query('BEGIN');
        const newRecordId = await insertRecordTagsRelationQuery(client, recordId, tagIds);
        client.query('COMMIT');
    }
    catch (err) {
        client.query('ROLLBACK');
        defaultDatabaseErrorHandler(err as Error, DbErrorMessage.DeletionError);
        return Promise.reject(err)
    }
    finally {  
        client.release();
    }
}


////////////////////////////////
//         DELETIONS          //
////////////////////////////////

export const deleteRecord = async (recordId: number): Promise<void> => {

    const client = await pool.connect();

    try  {
        await client.query('BEGIN');

        const queryRecordRes = await deleteRecordQuery(client, recordId)
        const queryTagsRes = await deleteRecordTagsRelationQuery(client, recordId);

        await client.query('COMMIT');

        //return Promise.resolve({ success: true });
    }
    catch (err)  { 
        await client.query('ROLLBACK');

        defaultDatabaseErrorHandler(err as Error, DbErrorMessage.DeletionError);
        return Promise.reject(err)
    }
    finally {
        client.release();
    }
}

////////////////////////////////
//         UPDATES            //
////////////////////////////////


export const updateRecordData = async (recordData: RecordDataPartial): Promise<void> => {

    const client = await pool.connect();

    try  {
        client.query('BEGIN');
        const updateRecordRes = await updateWholeRecordQuery(client, recordData as RecordData); // TODO: redesign the interface
        const deletionQueryRes = await deleteRecordTagsRelationQuery(client, recordData.id as number);
        const tagInsertionQueryRes =  await insertRecordTagsRelationQuery(client, recordData.id as number, recordData.tags as number[]);

        client.query('COMMIT');
    }
    catch (err) {
        client.query('ROLLBACK');
        defaultDatabaseErrorHandler(err as Error, DbErrorMessage.DeletionError);
        return Promise.reject(err)
    }
    finally {  
        client.release();
    }
}