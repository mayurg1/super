export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_cases: {
        Row: {
          assignee_id: string | null
          case_type: string
          closed_at: string | null
          created_at: string
          id: string
          priority: number
          report_id: string | null
          status: string
          subject_id: string | null
          subject_type: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          case_type: string
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: number
          report_id?: string | null
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          case_type?: string
          closed_at?: string | null
          created_at?: string
          id?: string
          priority?: number
          report_id?: string | null
          status?: string
          subject_id?: string | null
          subject_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_cases_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_cases_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "moderation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          actor_id: string | null
          entity_id: string | null
          entity_type: string | null
          event_name: string
          id: string
          metadata: Json
          occurred_at: string
          session_id: string | null
        }
        Insert: {
          actor_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_name: string
          id?: string
          metadata?: Json
          occurred_at?: string
          session_id?: string | null
        }
        Update: {
          actor_id?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_name?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_hash: string | null
          metadata: Json
          request_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_hash?: string | null
          metadata?: Json
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contributions: {
        Row: {
          amount: number
          campaign_id: string
          contributor_id: string | null
          created_at: string
          currency: string
          id: string
          payment_reference: string | null
          status: string
        }
        Insert: {
          amount: number
          campaign_id: string
          contributor_id?: string | null
          created_at?: string
          currency: string
          id?: string
          payment_reference?: string | null
          status?: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          contributor_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          payment_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contributions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contributions_contributor_id_fkey"
            columns: ["contributor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_updates: {
        Row: {
          author_id: string
          body: string
          campaign_id: string
          created_at: string
          id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          campaign_id: string
          created_at?: string
          id?: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          campaign_id?: string
          created_at?: string
          id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          creator_id: string
          currency: string
          ends_at: string
          goal_amount: number
          id: string
          project_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          currency?: string
          ends_at: string
          goal_amount: number
          id?: string
          project_id: string
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          currency?: string
          ends_at?: string
          goal_amount?: number
          id?: string
          project_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      campuses: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string
          requested_by: string
          status: string
          updated_at: string
          user_high_id: string
          user_low_id: string
        }
        Insert: {
          created_at?: string
          requested_by: string
          status?: string
          updated_at?: string
          user_high_id: string
          user_low_id: string
        }
        Update: {
          created_at?: string
          requested_by?: string
          status?: string
          updated_at?: string
          user_high_id?: string
          user_low_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_high_id_fkey"
            columns: ["user_high_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_low_id_fkey"
            columns: ["user_low_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          member_role: string
          muted: boolean
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          member_role?: string
          muted?: boolean
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          member_role?: string
          muted?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          conversation_type: string
          created_at: string
          creator_id: string | null
          id: string
          last_message_at: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          conversation_type: string
          created_at?: string
          creator_id?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          conversation_type?: string
          created_at?: string
          creator_id?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_metrics: {
        Row: {
          campus_id: string
          metric_date: string
          metric_key: string
          metric_value: number
          updated_at: string
        }
        Insert: {
          campus_id: string
          metric_date: string
          metric_key: string
          metric_value: number
          updated_at?: string
        }
        Update: {
          campus_id?: string
          metric_date?: string
          metric_key?: string
          metric_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_metrics_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          campus_id: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          campus_id: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          campus_id?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      event_media: {
        Row: {
          created_at: string
          event_id: string
          id: string
          media_asset_id: string
          position: number
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          media_asset_id: string
          position: number
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          media_asset_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          checked_in_at: string | null
          created_at: string
          event_id: string
          status: string
          updated_at: string
          user_id: string
          waitlist_position: number | null
        }
        Insert: {
          checked_in_at?: string | null
          created_at?: string
          event_id: string
          status?: string
          updated_at?: string
          user_id: string
          waitlist_position?: number | null
        }
        Update: {
          checked_in_at?: string | null
          created_at?: string
          event_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          campus_id: string
          capacity: number | null
          created_at: string
          deleted_at: string | null
          description: string
          ends_at: string
          id: string
          organizer_id: string
          registration_deadline: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          venue: string
          visibility: string
        }
        Insert: {
          campus_id: string
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          ends_at: string
          id?: string
          organizer_id: string
          registration_deadline?: string | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
          venue: string
          visibility?: string
        }
        Update: {
          campus_id?: string
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          ends_at?: string
          id?: string
          organizer_id?: string
          registration_deadline?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          venue?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string
          is_enabled: boolean
          key: string
          scope: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          is_enabled?: boolean
          key: string
          scope?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          is_enabled?: boolean
          key?: string
          scope?: Json
          updated_at?: string
        }
        Relationships: []
      }
      feature_registry: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          is_enabled: boolean
          key: string
          module_group: string
          name: string
          route: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_enabled?: boolean
          key: string
          module_group: string
          name: string
          route?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_enabled?: boolean
          key?: string
          module_group?: string
          name?: string
          route?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      food_menu_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_menu_categories_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "food_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      food_menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          currency: string
          description: string
          id: string
          is_available: boolean
          media_asset_id: string | null
          name: string
          price: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_available?: boolean
          media_asset_id?: string | null
          name: string
          price: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          is_available?: boolean
          media_asset_id?: string | null
          name?: string
          price?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "food_menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_menu_items_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_menu_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "food_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      food_order_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          note: string
          order_id: string
          status: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id: string
          status: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_order_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      food_order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          menu_item_id: string | null
          order_id: string
          quantity: number
          title_snapshot: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          menu_item_id?: string | null
          order_id: string
          quantity: number
          title_snapshot: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          title_snapshot?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "food_menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "food_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      food_orders: {
        Row: {
          buyer_id: string
          created_at: string
          currency: string
          delivery_location: string | null
          fulfillment_type: string
          id: string
          order_status: string
          payment_status: string
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          currency?: string
          delivery_location?: string | null
          fulfillment_type: string
          id?: string
          order_status?: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          currency?: string
          delivery_location?: string | null
          fulfillment_type?: string
          id?: string
          order_status?: string
          payment_status?: string
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "food_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      food_vendors: {
        Row: {
          campus_id: string
          contact: string | null
          created_at: string
          id: string
          manager_id: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          campus_id: string
          contact?: string | null
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          campus_id?: string
          contact?: string | null
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_vendors_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_vendors_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_attendance: {
        Row: {
          attendance_date: string
          created_at: string
          hostel_id: string
          id: string
          marked_by: string
          notes: string
          resident_id: string
          status: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          hostel_id: string
          id?: string
          marked_by: string
          notes?: string
          resident_id: string
          status: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          hostel_id?: string
          id?: string
          marked_by?: string
          notes?: string
          resident_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_attendance_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_attendance_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_blocks: {
        Row: {
          code: string
          created_at: string
          hostel_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          hostel_id: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          hostel_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_blocks_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_complaints: {
        Row: {
          assignee_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          resident_id: string
          room_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          resident_id: string
          room_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          resident_id?: string
          room_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_complaints_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_complaints_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_complaints_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_room_allocations: {
        Row: {
          created_at: string
          ends_on: string | null
          id: string
          resident_id: string
          room_id: string
          starts_on: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on?: string | null
          id?: string
          resident_id: string
          room_id: string
          starts_on: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string | null
          id?: string
          resident_id?: string
          room_id?: string
          starts_on?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_room_allocations_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_room_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          block_id: string
          capacity: number
          created_at: string
          id: string
          room_number: string
          room_type: string
          status: string
          updated_at: string
        }
        Insert: {
          block_id: string
          capacity: number
          created_at?: string
          id?: string
          room_number: string
          room_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          block_id?: string
          capacity?: number
          created_at?: string
          id?: string
          room_number?: string
          room_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_rooms_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "hostel_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          campus_id: string
          created_at: string
          eligibility: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          campus_id: string
          created_at?: string
          eligibility?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          campus_id?: string
          created_at?: string
          eligibility?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostels_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      job_application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          id: string
          media_asset_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          id?: string
          media_asset_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          id?: string
          media_asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_application_documents_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string
          created_at: string
          id: string
          job_id: string
          resume_asset_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string
          created_at?: string
          id?: string
          job_id: string
          resume_asset_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string
          created_at?: string
          id?: string
          job_id?: string
          resume_asset_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_asset_id_fkey"
            columns: ["resume_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string
          job_id: string
          requirement_level: number | null
          skill_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          requirement_level?: number | null
          skill_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          requirement_level?: number | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          campus_id: string
          created_at: string
          deadline: string | null
          deleted_at: string | null
          description: string
          employer: string
          employment_type: string
          id: string
          location: string | null
          poster_id: string
          status: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          campus_id: string
          created_at?: string
          deadline?: string | null
          deleted_at?: string | null
          description: string
          employer: string
          employment_type: string
          id?: string
          location?: string | null
          poster_id: string
          status?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          campus_id?: string
          created_at?: string
          deadline?: string | null
          deleted_at?: string | null
          description?: string
          employer?: string
          employment_type?: string
          id?: string
          location?: string | null
          poster_id?: string
          status?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_poster_id_fkey"
            columns: ["poster_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          campus_id: string
          category_id: string | null
          condition: string
          created_at: string
          currency: string
          deleted_at: string | null
          description: string
          id: string
          price: number
          search_document: unknown
          seller_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          campus_id: string
          category_id?: string | null
          condition: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string
          id?: string
          price: number
          search_document?: unknown
          seller_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          campus_id?: string
          category_id?: string | null
          condition?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          description?: string
          id?: string
          price?: number
          search_document?: unknown
          seller_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          bucket: string
          byte_size: number
          checksum: string | null
          created_at: string
          deleted_at: string | null
          height: number | null
          id: string
          mime_type: string
          object_path: string
          owner_id: string
          status: string
          updated_at: string
          width: number | null
        }
        Insert: {
          bucket: string
          byte_size: number
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          mime_type: string
          object_path: string
          owner_id: string
          status?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          bucket?: string
          byte_size?: number
          checksum?: string | null
          created_at?: string
          deleted_at?: string | null
          height?: number | null
          id?: string
          mime_type?: string
          object_path?: string
          owner_id?: string
          status?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          id: string
          media_asset_id: string
          message_id: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          media_asset_id: string
          message_id: string
          position: number
        }
        Update: {
          created_at?: string
          id?: string
          media_asset_id?: string
          message_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_receipts: {
        Row: {
          delivered_at: string | null
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          delivered_at?: string | null
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          delivered_at?: string | null
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          message_type: string
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          message_type?: string
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          reason: string
          report_id: string | null
          subject_id: string
          subject_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          report_id?: string | null
          subject_id: string
          subject_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          reason?: string
          report_id?: string | null
          subject_id?: string
          subject_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "moderation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reason_code: string
          reporter_id: string
          resolved_at: string | null
          reviewer_id: string | null
          status: string
          subject_id: string
          subject_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          reason_code: string
          reporter_id: string
          resolved_at?: string | null
          reviewer_id?: string | null
          status?: string
          subject_id: string
          subject_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reason_code?: string
          reporter_id?: string
          resolved_at?: string | null
          reviewer_id?: string | null
          status?: string
          subject_id?: string
          subject_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_reports_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempted_at: string | null
          channel: string
          created_at: string
          id: string
          notification_id: string
          provider_reference: string | null
          status: string
        }
        Insert: {
          attempted_at?: string | null
          channel: string
          created_at?: string
          id?: string
          notification_id: string
          provider_reference?: string | null
          status?: string
        }
        Update: {
          attempted_at?: string | null
          channel?: string
          created_at?: string
          id?: string
          notification_id?: string
          provider_reference?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          body_template: string
          channel: string
          created_at: string
          id: string
          is_active: boolean
          key: string
          title_template: string
          updated_at: string
        }
        Insert: {
          body_template: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          title_template: string
          updated_at?: string
        }
        Update: {
          body_template?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          archived_at: string | null
          body: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          notification_type: string
          read_at: string | null
          recipient_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          archived_at?: string | null
          body: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          notification_type: string
          read_at?: string | null
          recipient_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          archived_at?: string | null
          body?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      outpass_requests: {
        Row: {
          created_at: string
          depart_at: string
          destination: string
          id: string
          reason: string
          resident_id: string
          return_at: string
          reviewer_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          depart_at: string
          destination: string
          id?: string
          reason: string
          resident_id: string
          return_at: string
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          depart_at?: string
          destination?: string
          id?: string
          reason?: string
          resident_id?: string
          return_at?: string
          reviewer_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outpass_requests_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outpass_requests_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payer_id: string | null
          provider: string
          provider_reference: string
          purpose_id: string
          purpose_type: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          id?: string
          payer_id?: string | null
          provider: string
          provider_reference: string
          purpose_id: string
          purpose_type: string
          status: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payer_id?: string | null
          provider?: string
          provider_reference?: string
          purpose_id?: string
          purpose_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string
          id: string
          key: string
          module: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key: string
          module: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key?: string
          module?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          label: string
          poll_id: string
          position: number
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          poll_id: string
          position: number
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          poll_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Insert: {
          created_at?: string
          option_id: string
          poll_id: string
          voter_id: string
        }
        Update: {
          created_at?: string
          option_id?: string
          poll_id?: string
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "post_polls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_voter_id_fkey"
            columns: ["voter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          alt_text: string
          created_at: string
          id: string
          media_asset_id: string
          position: number
          post_id: string
        }
        Insert: {
          alt_text?: string
          created_at?: string
          id?: string
          media_asset_id: string
          position: number
          post_id: string
        }
        Update: {
          alt_text?: string
          created_at?: string
          id?: string
          media_asset_id?: string
          position?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_polls: {
        Row: {
          anonymous_results: boolean
          closes_at: string | null
          created_at: string
          id: string
          post_id: string
          question: string
        }
        Insert: {
          anonymous_results?: boolean
          closes_at?: string | null
          created_at?: string
          id?: string
          post_id: string
          question: string
        }
        Update: {
          anonymous_results?: boolean
          closes_at?: string | null
          created_at?: string
          id?: string
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          campus_id: string | null
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          published_at: string
          search_document: unknown
          status: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          body?: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          published_at?: string
          search_document?: unknown
          status?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          body?: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          published_at?: string
          search_document?: unknown
          status?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_favorites: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_media: {
        Row: {
          created_at: string
          id: string
          media_asset_id: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_asset_id: string
          position: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_asset_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reports: {
        Row: {
          created_at: string
          id: string
          product_id: string
          reason: string
          reporter_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          reason: string
          reporter_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          reason?: string
          reporter_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_educations: {
        Row: {
          created_at: string
          ended_on: string | null
          id: string
          institution: string
          profile_id: string
          program: string
          started_on: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          ended_on?: string | null
          id?: string
          institution: string
          profile_id: string
          program: string
          started_on?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          ended_on?: string | null
          id?: string
          institution?: string
          profile_id?: string
          program?: string
          started_on?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_educations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_experiences: {
        Row: {
          created_at: string
          employer: string
          ended_on: string | null
          id: string
          is_current: boolean
          profile_id: string
          started_on: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          employer: string
          ended_on?: string | null
          id?: string
          is_current?: boolean
          profile_id: string
          started_on?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          employer?: string
          ended_on?: string | null
          id?: string
          is_current?: boolean
          profile_id?: string
          started_on?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          created_at: string
          proficiency: number | null
          profile_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          proficiency?: number | null
          profile_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          proficiency?: number | null
          profile_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_asset_id: string | null
          bio: string
          campus_id: string | null
          created_at: string
          deleted_at: string | null
          department_id: string | null
          directory_visibility: string
          display_name: string
          family_name: string | null
          given_name: string | null
          graduation_year: number | null
          handle: string
          id: string
          is_active: boolean
          program_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_asset_id?: string | null
          bio?: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          directory_visibility?: string
          display_name: string
          family_name?: string | null
          given_name?: string | null
          graduation_year?: number | null
          handle: string
          id: string
          is_active?: boolean
          program_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_asset_id?: string | null
          bio?: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          department_id?: string | null
          directory_visibility?: string
          display_name?: string
          family_name?: string | null
          given_name?: string | null
          graduation_year?: number | null
          handle?: string
          id?: string
          is_active?: boolean
          program_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_avatar_asset_fk"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          code: string
          created_at: string
          department_id: string
          id: string
          level: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          id?: string
          level: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          id?: string
          level?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      project_media: {
        Row: {
          created_at: string
          id: string
          media_asset_id: string
          position: number
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_asset_id: string
          position: number
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_asset_id?: string
          position?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_media_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          member_role: string
          message: string
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          member_role: string
          message?: string
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          member_role?: string
          message?: string
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_skills: {
        Row: {
          created_at: string
          project_id: string
          requirement_level: number | null
          skill_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
          requirement_level?: number | null
          skill_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
          requirement_level?: number | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_skills_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          body: string
          campus_id: string | null
          category: string
          created_at: string
          deleted_at: string | null
          id: string
          owner_id: string
          status: string
          summary: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          body?: string
          campus_id?: string | null
          category: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          owner_id: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          body?: string
          campus_id?: string | null
          category?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          owner_id?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_features: {
        Row: {
          created_at: string
          feature_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "feature_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_features_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string
          id: string
          is_system: boolean
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_id: string
          campus_id: string | null
          created_at: string
          deleted_at: string | null
          expires_at: string
          id: string
          media_asset_id: string
          status: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at: string
          id?: string
          media_asset_id: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          campus_id?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at?: string
          id?: string
          media_asset_id?: string
          status?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          campus_id: string | null
          created_at: string
          expires_at: string | null
          granted_by: string | null
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          campus_id?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          campus_id?: string | null
          created_at?: string
          expires_at?: string | null
          granted_by?: string | null
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_campus_id_fkey"
            columns: ["campus_id"]
            isOneToOne: false
            referencedRelation: "campuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          locale: string
          preferences: Json
          push_notifications: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          locale?: string
          preferences?: Json
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          locale?: string
          preferences?: Json
          push_notifications?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_post: {
        Args: { p: Database["public"]["Tables"]["posts"]["Row"] }
        Returns: boolean
      }
      current_campus_id: { Args: never; Returns: string }
      current_profile_id: { Args: never; Returns: string }
      has_feature: {
        Args: { feature_key: string; scope_campus_id?: string }
        Returns: boolean
      }
      has_permission: {
        Args: { permission_key: string; scope_campus_id?: string }
        Returns: boolean
      }
      is_valid_object_path: { Args: { value: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
