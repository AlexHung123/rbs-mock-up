import { request } from '@/utils/request';
import type { Equipment, EquipmentType } from '@/types';

export interface ListEquipmentParams {
  type?: EquipmentType;
  availableOnly?: boolean;
}

export async function listEquipment(params: ListEquipmentParams = {}) {
  return request<Equipment[]>('/api/equipment', { params });
}
