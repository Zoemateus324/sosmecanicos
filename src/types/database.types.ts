export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          user_type: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          user_type: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          user_type?: string
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          user_id: string
          service_type: string
          status: string
          description: string
          location: Json
          created_at: string
          updated_at: string
          vehicle_info?: Json
          review?: Json
        }
        Insert: {
          id?: string
          user_id: string
          service_type: string
          status?: string
          description: string
          location: Json
          created_at?: string
          updated_at?: string
          vehicle_info?: Json
          review?: Json
        }
        Update: {
          id?: string
          user_id?: string
          service_type?: string
          status?: string
          description?: string
          location?: Json
          created_at?: string
          updated_at?: string
          vehicle_info?: Json
          review?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 