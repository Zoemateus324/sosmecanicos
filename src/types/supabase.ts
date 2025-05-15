// Define a Json type compatible with Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
       
Row: {
          id: string;
          full_name: string;
          email: string;
          user_type: string;
          phone: string;
          created_at: string;
        };
      };
      service_requests: {
        Row: {
          id: string;
          user_id: string;
          service_type: string;
          description: string;
          location: Json;
          vehicle_info: Json;
          status: string;
          created_at: string;
          updated_at: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
      };
    };
  };
};