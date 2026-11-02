export interface ExtendSalonDurationPayload {
  subscription_status: string;
  extend_subscription_days?: number;
  duration_days?: number;
}

export interface ExtendSalonDurationResponse {
  message: string;
  salon: Partial<import('../list-salons/list-salons.service').SalonItem>;
}
