export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string
          user_type: string
          created_at?: string
        }
        Insert: {
          id: string
          nome: string
          email: string
          telefone: string
          user_type: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string
          user_type?: string
          created_at?: string
        }
      }
      tow_requests: {
        Row: {
          id: string
          origin: string
          destination: string
          created_at: string
          cliente_id: string
          status: string
          guincho_id: string | null
          valor: number | null
        }
        Insert: {
          id?: string
          origin: string
          destination: string
          created_at?: string
          cliente_id: string
          status?: string
          guincho_id?: string | null
          valor?: number | null
        }
        Update: {
          id?: string
          origin?: string
          destination?: string
          created_at?: string
          cliente_id?: string
          status?: string
          guincho_id?: string | null
          valor?: number | null
        }
      }
    }
  }
}