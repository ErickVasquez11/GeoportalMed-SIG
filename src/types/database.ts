export interface Database {
  public: {
    Tables: {
      medical_centers: {
        Row: {
          id: string;
          name: string;
          type: 'hospital' | 'clinic' | 'health_center';
          lat: number;
          lng: number;
          address: string;
          phone: string;
          schedule: string;
          services: string[];
          emergency: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'hospital' | 'clinic' | 'health_center';
          lat: number;
          lng: number;
          address: string;
          phone: string;
          schedule: string;
          services: string[];
          emergency: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'hospital' | 'clinic' | 'health_center';
          lat?: number;
          lng?: number;
          address?: string;
          phone?: string;
          schedule?: string;
          services?: string[];
          emergency?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}