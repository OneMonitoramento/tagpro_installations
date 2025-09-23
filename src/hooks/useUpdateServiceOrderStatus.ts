"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface UpdateServiceOrderStatusParams {
  serviceOrderId: string;
  status: 'pending' | 'done';
}

interface UpdateServiceOrderStatusResponse {
  success: boolean;
  message: string;
}

const updateServiceOrderStatus = async ({
  serviceOrderId,
  status
}: UpdateServiceOrderStatusParams): Promise<UpdateServiceOrderStatusResponse> => {
  const response = await api.patch(`/service-orders/${serviceOrderId}/status`, {
    status
  });

  return response.data;
};

export const useUpdateServiceOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateServiceOrderStatus,
    onSuccess: () => {
      // Invalidate dashboard stats to refresh statistics
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Invalidate service orders queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });

      // Invalidate vehicle queries if they depend on service order status
      queryClient.invalidateQueries({ queryKey: ["placas"] });
      queryClient.invalidateQueries({ queryKey: ["estatisticas-gerais"] });
    },
    onError: (error) => {
      console.error('Error updating service order status:', error);
    }
  });
};