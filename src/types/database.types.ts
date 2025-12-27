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
                    phone: string | null
                    language: string
                    avatar_url: string | null
                    created_at: string
                    skills: string[] | null
                    points: number
                }
                Insert: {
                    id: string
                    phone?: string | null
                    language?: string
                    created_at?: string
                    skills?: string[] | null
                    points?: number
                }
                Update: {
                    id?: string
                    phone?: string | null
                    language?: string
                    created_at?: string
                    skills?: string[] | null
                    points?: number
                }
            }
            onboarding_responses: {
                Row: {
                    user_id: string
                    income_range: string | null
                    fixed_expenses: number | null
                    biggest_stress: string | null
                    monthly_goal: string | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    income_range?: string | null
                    fixed_expenses?: number | null
                    biggest_stress?: string | null
                    monthly_goal?: string | null
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    income_range?: string | null
                    fixed_expenses?: number | null
                    biggest_stress?: string | null
                    monthly_goal?: string | null
                    created_at?: string
                }
            }
            user_settings: {
                Row: {
                    user_id: string
                    notifications_enabled: boolean
                    currency: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    notifications_enabled?: boolean
                    currency?: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    notifications_enabled?: boolean
                    currency?: string
                    created_at?: string
                }
            }
            wallets: {
                Row: {
                    id: string
                    user_id: string
                    balance: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    balance?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    balance?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    type: "income" | "expense"
                    category: string
                    description: string | null
                    date: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    type: "income" | "expense"
                    category: string
                    description?: string | null
                    date?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    type?: "income" | "expense"
                    category?: string
                    description?: string | null
                    date?: string
                    created_at?: string
                }
            }
            bills: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    amount: number
                    due_date: string
                    is_paid: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    amount: number
                    due_date: string
                    is_paid?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    amount?: number
                    due_date?: string
                    is_paid?: boolean
                    created_at?: string
                }
            }
        }
    }
}
