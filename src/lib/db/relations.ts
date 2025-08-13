import { relations } from 'drizzle-orm';
import { sgaHinovaClient } from './sgaHinovaClient';
import { sgaHinovaVehicle } from './sgaHinovaVehicle';
import { sgaServiceOrders } from './sgaServiceOrders';

export const sgaHinovaClientRelations = relations(sgaHinovaClient, ({ many }) => ({
  vehicles: many(sgaHinovaVehicle),
}));

export const sgaHinovaVehicleRelations = relations(sgaHinovaVehicle, ({ one, many }) => ({
  client: one(sgaHinovaClient, {
    fields: [sgaHinovaVehicle.sgaClientId],
    references: [sgaHinovaClient.sgaClientId],
  }),
  serviceOrders: many(sgaServiceOrders),
}));

export const sgaServiceOrdersRelations = relations(sgaServiceOrders, ({ one }) => ({
  vehicle: one(sgaHinovaVehicle, {
    fields: [sgaServiceOrders.sgaVehicleId],
    references: [sgaHinovaVehicle.sgaVehicleId],
  }),
}));