import { UserRole } from "./role.type";

export interface User {
  id?: number;
  name: string;
  last_name: string;
  email: string;
  password?: string;
  role: 'admin' | 'warehouseman' | 'user';
  customer_type: 'individual' | 'institutional';
  tax_id?: string; // DNI, RUC o NIT
  active: boolean;
  created_at?: string;
}
