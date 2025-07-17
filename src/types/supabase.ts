export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          cep: string | null
          cidade: string | null
          conta: Database["public"]["Enums"]["tipo-conta-usuario"] | null
          "cpf/cnpj": string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string | null
          sobrenome: string | null
          telefone: string | null
          updated_at: string | null
          veiculos: number | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          conta?: Database["public"]["Enums"]["tipo-conta-usuario"] | null
          "cpf/cnpj"?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string | null
          veiculos?: number | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          conta?: Database["public"]["Enums"]["tipo-conta-usuario"] | null
          "cpf/cnpj"?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string | null
          sobrenome?: string | null
          telefone?: string | null
          updated_at?: string | null
          veiculos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_veiculos_fkey"
            columns: ["veiculos"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      solicitacoes: {
        Row: {
          created_at: string
          "descricao-solicitacao": string | null
          id: number
          ServiceStatus: Database["public"]["Enums"]["ServiceStatus"] | null
          "status-orcamento": Database["public"]["Enums"]["QuoteStatus"] | null
          "tipo-servico": Database["public"]["Enums"]["tipo-servico"] | null
          usuario: string | null
          veiculo: number | null
        }
        Insert: {
          created_at?: string
          "descricao-solicitacao"?: string | null
          id?: number
          ServiceStatus?: Database["public"]["Enums"]["ServiceStatus"] | null
          "status-orcamento"?: Database["public"]["Enums"]["QuoteStatus"] | null
          "tipo-servico"?: Database["public"]["Enums"]["tipo-servico"] | null
          usuario?: string | null
          veiculo?: number | null
        }
        Update: {
          created_at?: string
          "descricao-solicitacao"?: string | null
          id?: number
          ServiceStatus?: Database["public"]["Enums"]["ServiceStatus"] | null
          "status-orcamento"?: Database["public"]["Enums"]["QuoteStatus"] | null
          "tipo-servico"?: Database["public"]["Enums"]["tipo-servico"] | null
          usuario?: string | null
          veiculo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_veiculo_fkey"
            columns: ["veiculo"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          categoria: Database["public"]["Enums"]["categorias"] | null
          combustivel: Database["public"]["Enums"]["FuelType"] | null
          cor: string | null
          created_at: string
          "foto-veiculo": string | null
          id: number
          marca: string | null
          modelo: string | null
          placa: string | null
          "tipo-veiculo": Database["public"]["Enums"]["tipo"] | null
          user_id: string | null
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["categorias"] | null
          combustivel?: Database["public"]["Enums"]["FuelType"] | null
          cor?: string | null
          created_at?: string
          "foto-veiculo"?: string | null
          id?: number
          marca?: string | null
          modelo?: string | null
          placa?: string | null
          "tipo-veiculo"?: Database["public"]["Enums"]["tipo"] | null
          user_id?: string | null
        }
        Update: {
          categoria?: Database["public"]["Enums"]["categorias"] | null
          combustivel?: Database["public"]["Enums"]["FuelType"] | null
          cor?: string | null
          created_at?: string
          "foto-veiculo"?: string | null
          id?: number
          marca?: string | null
          modelo?: string | null
          placa?: string | null
          "tipo-veiculo"?: Database["public"]["Enums"]["tipo"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: { user_id: string; user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      categorias: "Automóveis" | "Motocicletas" | "Caminhões" | "Ônibus"
      FuelType: "gasolina" | "etanol" | "diesel" | "eletrico" | "hibrido"
      MechanicStatus: "active" | "inactive"
      Plan: "Gratuito" | "Básico" | "Premium"
      QuoteStatus: "pendente" | "aprovado" | "rejeitado" | "expirado"
      ServiceStatus: "pendente" | "em_andamento" | "concluido" | "cancelado"
      tipo:
        | "Hatch"
        | "Sedan"
        | "SUV"
        | "Crossover"
        | "Picape"
        | "Minivan"
        | "Esportivo"
        | "Motonetas"
        | "Motocicletas"
        | "Triciclos"
        | "Quadriciclos"
        | "Truck"
        | "Toco"
        | "Traçado"
        | "Bi-truck"
        | "Carretas"
        | "Ônibus"
        | "Micro-ônibus"
        | "Bonde"
      "tipo-conta-usuario": "Cliente" | "Mecanico" | "Guincho" | "Seguradora"
      "tipo-servico":
        | "Revisão"
        | "Troca de óleo"
        | "Freios"
        | "Suspensão"
        | "Motor"
        | "Transmissão"
        | "Ar condicionado"
        | "Sistema elétrico"
        | "Pneus"
        | "Outros"
      UserRole: "cliente" | "mecanico" | "guincho" | "seguradora"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      categorias: ["Automóveis", "Motocicletas", "Caminhões", "Ônibus"],
      FuelType: ["gasolina", "etanol", "diesel", "eletrico", "hibrido"],
      MechanicStatus: ["active", "inactive"],
      Plan: ["Gratuito", "Básico", "Premium"],
      QuoteStatus: ["pendente", "aprovado", "rejeitado", "expirado"],
      ServiceStatus: ["pendente", "em_andamento", "concluido", "cancelado"],
      tipo: [
        "Hatch",
        "Sedan",
        "SUV",
        "Crossover",
        "Picape",
        "Minivan",
        "Esportivo",
        "Motonetas",
        "Motocicletas",
        "Triciclos",
        "Quadriciclos",
        "Truck",
        "Toco",
        "Traçado",
        "Bi-truck",
        "Carretas",
        "Ônibus",
        "Micro-ônibus",
        "Bonde",
      ],
      "tipo-conta-usuario": ["Cliente", "Mecanico", "Guincho", "Seguradora"],
      "tipo-servico": [
        "Revisão",
        "Troca de óleo",
        "Freios",
        "Suspensão",
        "Motor",
        "Transmissão",
        "Ar condicionado",
        "Sistema elétrico",
        "Pneus",
        "Outros",
      ],
      UserRole: ["cliente", "mecanico", "guincho", "seguradora"],
    },
  },
} as const
