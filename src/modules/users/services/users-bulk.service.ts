import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  BulkApprovePayload,
  BulkRejectPayload,
  BulkChangeAccessPayload,
  BulkOperationResult
} from '../types/user-bulk.types';

export class UsersBulkService {
  private functions = getFunctions();

  async bulkApprove(payload: BulkApprovePayload): Promise<BulkOperationResult> {
    const callable = httpsCallable<BulkApprovePayload, BulkOperationResult>(
      this.functions,
      'bulkApproveUsers'
    );
    const result = await callable(payload);
    return result.data;
  }

  async bulkReject(payload: BulkRejectPayload): Promise<BulkOperationResult> {
    const callable = httpsCallable<BulkRejectPayload, BulkOperationResult>(
      this.functions,
      'bulkRejectUsers'
    );
    const result = await callable(payload);
    return result.data;
  }

  async bulkChangeAccess(payload: BulkChangeAccessPayload): Promise<BulkOperationResult> {
    const callable = httpsCallable<BulkChangeAccessPayload, BulkOperationResult>(
      this.functions,
      'bulkChangeUserAccess'
    );
    const result = await callable(payload);
    return result.data;
  }
}

export const usersBulkService = new UsersBulkService();
