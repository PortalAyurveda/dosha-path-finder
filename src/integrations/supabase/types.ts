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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agenda_semana: {
        Row: {
          artigos: Json | null
          ativo: boolean
          corpo: string | null
          dosha: string
          id: number
          receitas: Json | null
          semana: string
          titulo: string
        }
        Insert: {
          artigos?: Json | null
          ativo?: boolean
          corpo?: string | null
          dosha: string
          id?: never
          receitas?: Json | null
          semana: string
          titulo: string
        }
        Update: {
          artigos?: Json | null
          ativo?: boolean
          corpo?: string | null
          dosha?: string
          id?: never
          receitas?: Json | null
          semana?: string
          titulo?: string
        }
        Relationships: []
      }
      akasha_demo: {
        Row: {
          ativo: boolean
          id: number
          ordem: number
          pergunta: string
          resposta: string
        }
        Insert: {
          ativo?: boolean
          id?: never
          ordem: number
          pergunta: string
          resposta: string
        }
        Update: {
          ativo?: boolean
          id?: never
          ordem?: number
          pergunta?: string
          resposta?: string
        }
        Relationships: []
      }
      akasha_memory: {
        Row: {
          data_postagem: string | null
          email: string | null
          id: number
          tags: string | null
          texto_inicio: string | null
          texto_resumo: string | null
          titulo: string | null
        }
        Insert: {
          data_postagem?: string | null
          email?: string | null
          id?: number
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
        }
        Update: {
          data_postagem?: string | null
          email?: string | null
          id?: number
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      akasha_tags_inventory: {
        Row: {
          count: number | null
          tag_name: string
        }
        Insert: {
          count?: number | null
          tag_name: string
        }
        Update: {
          count?: number | null
          tag_name?: string
        }
        Relationships: []
      }
      arquitetura_fluxos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          edge_functions: string[] | null
          fluxo_nome: string
          gatilho: string | null
          id: string
          observacoes: string | null
          passos: Json | null
          resumo: string | null
          status_saude: string | null
          tabelas_tocadas: string[] | null
          telas: string[] | null
          updated_at: string | null
          verificado_em: string | null
          webhooks: string[] | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          edge_functions?: string[] | null
          fluxo_nome: string
          gatilho?: string | null
          id?: string
          observacoes?: string | null
          passos?: Json | null
          resumo?: string | null
          status_saude?: string | null
          tabelas_tocadas?: string[] | null
          telas?: string[] | null
          updated_at?: string | null
          verificado_em?: string | null
          webhooks?: string[] | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          edge_functions?: string[] | null
          fluxo_nome?: string
          gatilho?: string | null
          id?: string
          observacoes?: string | null
          passos?: Json | null
          resumo?: string | null
          status_saude?: string | null
          tabelas_tocadas?: string[] | null
          telas?: string[] | null
          updated_at?: string | null
          verificado_em?: string | null
          webhooks?: string[] | null
        }
        Relationships: []
      }
      arquitetura_tabelas: {
        Row: {
          categoria: string | null
          conversa_com: string[] | null
          created_at: string | null
          escrito_por: Json | null
          id: string
          lido_por: Json | null
          linhas: number | null
          modulos_devlog: string[] | null
          observacoes: string | null
          papel: string | null
          schema_nome: string
          status_saude: string | null
          tabela: string
          updated_at: string | null
          verificado_em: string | null
        }
        Insert: {
          categoria?: string | null
          conversa_com?: string[] | null
          created_at?: string | null
          escrito_por?: Json | null
          id?: string
          lido_por?: Json | null
          linhas?: number | null
          modulos_devlog?: string[] | null
          observacoes?: string | null
          papel?: string | null
          schema_nome: string
          status_saude?: string | null
          tabela: string
          updated_at?: string | null
          verificado_em?: string | null
        }
        Update: {
          categoria?: string | null
          conversa_com?: string[] | null
          created_at?: string | null
          escrito_por?: Json | null
          id?: string
          lido_por?: Json | null
          linhas?: number | null
          modulos_devlog?: string[] | null
          observacoes?: string | null
          papel?: string | null
          schema_nome?: string
          status_saude?: string | null
          tabela?: string
          updated_at?: string | null
          verificado_em?: string | null
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          canceled_at: string | null
          created_at: string
          email: string
          id: string
          nome: string | null
          plano: string
          status: string
          stripe_customer_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          plano: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          plano?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      assistaliment: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      auditoria_rag: {
        Row: {
          akasha_status: string | null
          busca_tecnica: string | null
          contexto_recuperado: string | null
          data_hora: string | null
          email_aluno: string | null
          id: number
          pergunta_original: string | null
          resposta_final: string | null
        }
        Insert: {
          akasha_status?: string | null
          busca_tecnica?: string | null
          contexto_recuperado?: string | null
          data_hora?: string | null
          email_aluno?: string | null
          id?: number
          pergunta_original?: string | null
          resposta_final?: string | null
        }
        Update: {
          akasha_status?: string | null
          busca_tecnica?: string | null
          contexto_recuperado?: string | null
          data_hora?: string | null
          email_aluno?: string | null
          id?: number
          pergunta_original?: string | null
          resposta_final?: string | null
        }
        Relationships: []
      }
      aulas_ao_vivo: {
        Row: {
          button_delay_minutes: number
          button_text: string | null
          button_url: string | null
          created_at: string
          descricao: string | null
          destaque: boolean | null
          id: string
          is_active: boolean
          slug: string
          starts_at: string | null
          titulo: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          button_delay_minutes?: number
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          is_active?: boolean
          slug: string
          starts_at?: string | null
          titulo: string
          updated_at?: string
          youtube_url: string
        }
        Update: {
          button_delay_minutes?: number
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          is_active?: boolean
          slug?: string
          starts_at?: string | null
          titulo?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
      aulas_webinar: {
        Row: {
          ativo: boolean | null
          bullets: Json | null
          copy_box_whatsapp: string | null
          copy_confirmacao_subtitulo: string | null
          copy_confirmacao_titulo: string | null
          copy_descricao: string | null
          created_at: string | null
          data_hora: string | null
          foto_url: string | null
          id: string
          link_whatsapp: string | null
          slug: string
          subtitulo: string | null
          tema_paleta: string
          titulo_evento: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          bullets?: Json | null
          copy_box_whatsapp?: string | null
          copy_confirmacao_subtitulo?: string | null
          copy_confirmacao_titulo?: string | null
          copy_descricao?: string | null
          created_at?: string | null
          data_hora?: string | null
          foto_url?: string | null
          id?: string
          link_whatsapp?: string | null
          slug: string
          subtitulo?: string | null
          tema_paleta?: string
          titulo_evento: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          bullets?: Json | null
          copy_box_whatsapp?: string | null
          copy_confirmacao_subtitulo?: string | null
          copy_confirmacao_titulo?: string | null
          copy_descricao?: string | null
          created_at?: string | null
          data_hora?: string | null
          foto_url?: string | null
          id?: string
          link_whatsapp?: string | null
          slug?: string
          subtitulo?: string | null
          tema_paleta?: string
          titulo_evento?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean
          atualizado_em: string
          campanha: string
          criado_em: string
          html: string
          id: string
          ordem: number
          slot: string
          tags: string[]
          titulo_admin: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          campanha?: string
          criado_em?: string
          html: string
          id?: string
          ordem?: number
          slot: string
          tags?: string[]
          titulo_admin: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          campanha?: string
          criado_em?: string
          html?: string
          id?: string
          ordem?: number
          slot?: string
          tags?: string[]
          titulo_admin?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_slot_fkey"
            columns: ["slot"]
            isOneToOne: false
            referencedRelation: "banners_molde"
            referencedColumns: ["slot"]
          },
        ]
      }
      banners_molde: {
        Row: {
          atualizado_em: string
          contrato: string
          criado_em: string
          descricao: string
          exemplo_html: string | null
          slot: string
        }
        Insert: {
          atualizado_em?: string
          contrato: string
          criado_em?: string
          descricao: string
          exemplo_html?: string | null
          slot: string
        }
        Update: {
          atualizado_em?: string
          contrato?: string
          criado_em?: string
          descricao?: string
          exemplo_html?: string | null
          slot?: string
        }
        Relationships: []
      }
      banners_tags: {
        Row: {
          categoria: string
          descricao: string
          ordem: number
          tag: string
        }
        Insert: {
          categoria: string
          descricao: string
          ordem?: number
          tag: string
        }
        Update: {
          categoria?: string
          descricao?: string
          ordem?: number
          tag?: string
        }
        Relationships: []
      }
      bkp: {
        Row: {
          agniforte: number | null
          agnifraco: number | null
          agniirregular: number | null
          agniPrincipal: string | null
          agravKaphaTags: string | null
          agravPittaTags: string | null
          agravVataTags: string | null
          alimKapha: string | null
          alimPitta: string | null
          alimVata: string | null
          altura: string | null
          conhecimentoAyurveda: string | null
          created_at: string | null
          doshaprincipal: string | null
          idade: number | null
          imc: number | null
          kaphascore: number | null
          nivelkapha: string | null
          nivelpitta: string | null
          nivelvata: string | null
          peso: number | null
          pittascore: number | null
          relato_aberto: string | null
          vatascore: number | null
        }
        Insert: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string | null
          doshaprincipal?: string | null
          idade?: number | null
          imc?: number | null
          kaphascore?: number | null
          nivelkapha?: string | null
          nivelpitta?: string | null
          nivelvata?: string | null
          peso?: number | null
          pittascore?: number | null
          relato_aberto?: string | null
          vatascore?: number | null
        }
        Update: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string | null
          doshaprincipal?: string | null
          idade?: number | null
          imc?: number | null
          kaphascore?: number | null
          nivelkapha?: string | null
          nivelpitta?: string | null
          nivelvata?: string | null
          peso?: number | null
          pittascore?: number | null
          relato_aberto?: string | null
          vatascore?: number | null
        }
        Relationships: []
      }
      bling_tokens: {
        Row: {
          access_token: string
          expires_at: string
          id: number
          refresh_token: string
          updated_at: string
        }
        Insert: {
          access_token: string
          expires_at: string
          id?: number
          refresh_token: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          id?: number
          refresh_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_structure: {
        Row: {
          content: string | null
          created_at: string | null
          difficulty: string | null
          layer: number | null
          parent_ref: string | null
          ref_code: string
          sort_order: number
          tags: string | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          difficulty?: string | null
          layer?: number | null
          parent_ref?: string | null
          ref_code: string
          sort_order: number
          tags?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          difficulty?: string | null
          layer?: number | null
          parent_ref?: string | null
          ref_code?: string
          sort_order?: number
          tags?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      calculos: {
        Row: {
          GRUPO: string | null
          ITEM: string | null
          KAPHA: string | null
          ORDEM: number | null
          PITTA: string | null
          VATA: string | null
        }
        Insert: {
          GRUPO?: string | null
          ITEM?: string | null
          KAPHA?: string | null
          ORDEM?: number | null
          PITTA?: string | null
          VATA?: string | null
        }
        Update: {
          GRUPO?: string | null
          ITEM?: string | null
          KAPHA?: string | null
          ORDEM?: number | null
          PITTA?: string | null
          VATA?: string | null
        }
        Relationships: []
      }
      captacao_aula_secreta: {
        Row: {
          created_at: string | null
          dosha: string | null
          email: string
          email_enviado: boolean | null
          evento: string | null
          id: string
          nome: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string | null
          dosha?: string | null
          email: string
          email_enviado?: boolean | null
          evento?: string | null
          id?: string
          nome?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string | null
          dosha?: string | null
          email?: string
          email_enviado?: boolean | null
          evento?: string | null
          id?: string
          nome?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      captacao_webinar: {
        Row: {
          created_at: string | null
          dosha: string | null
          email: string
          email_enviado: boolean | null
          id: string
          nome: string | null
          webinar_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string | null
          dosha?: string | null
          email: string
          email_enviado?: boolean | null
          id?: string
          nome?: string | null
          webinar_id: string
          whatsapp: string
        }
        Update: {
          created_at?: string | null
          dosha?: string | null
          email?: string
          email_enviado?: boolean | null
          id?: string
          nome?: string | null
          webinar_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "captacao_webinar_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "aulas_webinar"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_aula: {
        Row: {
          created_at: string | null
          fonte: string | null
          id: string
          mensagem: string
          nome: string
          slug: string
          tipo: string | null
          user_id: string | null
          youtube_msg_id: string | null
        }
        Insert: {
          created_at?: string | null
          fonte?: string | null
          id?: string
          mensagem: string
          nome: string
          slug: string
          tipo?: string | null
          user_id?: string | null
          youtube_msg_id?: string | null
        }
        Update: {
          created_at?: string | null
          fonte?: string | null
          id?: string
          mensagem?: string
          nome?: string
          slug?: string
          tipo?: string | null
          user_id?: string | null
          youtube_msg_id?: string | null
        }
        Relationships: []
      }
      chat_histories: {
        Row: {
          data_hora: string | null
          id: number
          message: Json | null
          session_id: string | null
        }
        Insert: {
          data_hora?: string | null
          id?: number
          message?: Json | null
          session_id?: string | null
        }
        Update: {
          data_hora?: string | null
          id?: number
          message?: Json | null
          session_id?: string | null
        }
        Relationships: []
      }
      chat_histories_copy: {
        Row: {
          created_at: string | null
          email_usuario: string | null
          id: number
          message: Json
          metadata: Json | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          email_usuario?: string | null
          id?: number
          message: Json
          metadata?: Json | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          email_usuario?: string | null
          id?: number
          message?: Json
          metadata?: Json | null
          session_id?: string
        }
        Relationships: []
      }
      clarity_auditoria: {
        Row: {
          coletado_em: string
          created_at: string | null
          dead_clicks: number | null
          erros_click: number | null
          erros_script: number | null
          id: string
          paginas_por_sessao: number | null
          quickback_clicks: number | null
          rage_clicks: number | null
          scroll_excessivo: number | null
          scroll_profundidade: number | null
          sessoes: number | null
          tempo_engajamento_segundos: number | null
          url: string
          usuarios: number | null
        }
        Insert: {
          coletado_em: string
          created_at?: string | null
          dead_clicks?: number | null
          erros_click?: number | null
          erros_script?: number | null
          id?: string
          paginas_por_sessao?: number | null
          quickback_clicks?: number | null
          rage_clicks?: number | null
          scroll_excessivo?: number | null
          scroll_profundidade?: number | null
          sessoes?: number | null
          tempo_engajamento_segundos?: number | null
          url: string
          usuarios?: number | null
        }
        Update: {
          coletado_em?: string
          created_at?: string | null
          dead_clicks?: number | null
          erros_click?: number | null
          erros_script?: number | null
          id?: string
          paginas_por_sessao?: number | null
          quickback_clicks?: number | null
          rage_clicks?: number | null
          scroll_excessivo?: number | null
          scroll_profundidade?: number | null
          sessoes?: number | null
          tempo_engajamento_segundos?: number | null
          url?: string
          usuarios?: number | null
        }
        Relationships: []
      }
      cobrancas: {
        Row: {
          created_at: string
          criado_por: string | null
          descricao: string
          email_cliente: string | null
          id: string
          moeda: string
          nome_cliente: string | null
          paid_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_payment_link_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_session_id: string | null
          url: string | null
          valor: number
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          descricao: string
          email_cliente?: string | null
          id?: string
          moeda?: string
          nome_cliente?: string | null
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_session_id?: string | null
          url?: string | null
          valor: number
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          descricao?: string
          email_cliente?: string | null
          id?: string
          moeda?: string
          nome_cliente?: string | null
          paid_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_payment_link_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_session_id?: string | null
          url?: string | null
          valor?: number
        }
        Relationships: []
      }
      config_live: {
        Row: {
          ativo: boolean | null
          aula_slug: string | null
          id: number
          page_token: string | null
          updated_at: string | null
          video_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          aula_slug?: string | null
          id?: number
          page_token?: string | null
          updated_at?: string | null
          video_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          aula_slug?: string | null
          id?: number
          page_token?: string | null
          updated_at?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      content_likes: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      curso_aula_progresso: {
        Row: {
          aula_id: string
          concluida_em: string
          user_id: string
        }
        Insert: {
          aula_id: string
          concluida_em?: string
          user_id: string
        }
        Update: {
          aula_id?: string
          concluida_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_aula_progresso_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_aula_progresso_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas_indice"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_aulas: {
        Row: {
          created_at: string
          descricao: string | null
          duracao_segundos: number | null
          id: string
          modulo_id: string
          ordem: number
          titulo: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          id?: string
          modulo_id: string
          ordem?: number
          titulo: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          id?: string
          modulo_id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_aulas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "curso_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_materiais: {
        Row: {
          aula_id: string
          created_at: string
          id: string
          ordem: number
          storage_path: string | null
          tipo: string
          titulo: string
          url: string | null
        }
        Insert: {
          aula_id: string
          created_at?: string
          id?: string
          ordem?: number
          storage_path?: string | null
          tipo?: string
          titulo: string
          url?: string | null
        }
        Update: {
          aula_id?: string
          created_at?: string
          id?: string
          ordem?: number
          storage_path?: string | null
          tipo?: string
          titulo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_materiais_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_materiais_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas_indice"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_matriculas: {
        Row: {
          criado_em: string
          curso_id: string
          id: string
          origem: string
          status: string
          stripe_session_id: string | null
          user_id: string
          valor_pago: number | null
        }
        Insert: {
          criado_em?: string
          curso_id: string
          id?: string
          origem?: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
          valor_pago?: number | null
        }
        Update: {
          criado_em?: string
          curso_id?: string
          id?: string
          origem?: string
          status?: string
          stripe_session_id?: string | null
          user_id?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_matriculas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_modulos: {
        Row: {
          created_at: string
          curso_id: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_modulos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          ativo: boolean
          capa_url: string | null
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          preco: number | null
          preco_pix: number | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          preco?: number | null
          preco_pix?: number | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          capa_url?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          preco?: number | null
          preco_pix?: number | null
          slug?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      devlog: {
        Row: {
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          titulo: string
          versao: string
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          titulo: string
          versao: string
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          titulo?: string
          versao?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      documents_2: {
        Row: {
          content: string
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      dosha_test_questions: {
        Row: {
          created_at: string
          group: string | null
          id: string
          options: Json
          part: string
          sort_order: number
          tag_label: string | null
          text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          group?: string | null
          id?: string
          options?: Json
          part: string
          sort_order?: number
          tag_label?: string | null
          text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          group?: string | null
          id?: string
          options?: Json
          part?: string
          sort_order?: number
          tag_label?: string | null
          text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dosha_test_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          label: string | null
          snapshot: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          snapshot: Json
          version_number?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          label?: string | null
          snapshot?: Json
          version_number?: number
        }
        Relationships: []
      }
      doshas_registros: {
        Row: {
          agniforte: number | null
          agnifraco: number | null
          agniirregular: number | null
          agniPrincipal: string | null
          agravKaphaTags: string | null
          agravPittaTags: string | null
          agravVataTags: string | null
          aliment: string | null
          alimKapha: string | null
          alimPitta: string | null
          alimVata: string | null
          altura: string | null
          cidade: string | null
          conhecimentoAyurveda: string | null
          created_at: string
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_url: string | null
          id: string
          idade: number | null
          idPublico: string
          imc: number | null
          kaphascore: number | null
          mentoria: string | null
          nome: string | null
          objetivo1: string | null
          objetivo2: string | null
          pais: string | null
          peso: string | null
          pittascore: number | null
          produtos: string | null
          relato_aberto: string | null
          remedios: string | null
          reteste_sessao_id: string | null
          texto_ia: string | null
          tipo: string
          user_id: string | null
          vatascore: number | null
        }
        Insert: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          aliment?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          cidade?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_url?: string | null
          id?: string
          idade?: number | null
          idPublico: string
          imc?: number | null
          kaphascore?: number | null
          mentoria?: string | null
          nome?: string | null
          objetivo1?: string | null
          objetivo2?: string | null
          pais?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos?: string | null
          relato_aberto?: string | null
          remedios?: string | null
          reteste_sessao_id?: string | null
          texto_ia?: string | null
          tipo?: string
          user_id?: string | null
          vatascore?: number | null
        }
        Update: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          aliment?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          cidade?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_url?: string | null
          id?: string
          idade?: number | null
          idPublico?: string
          imc?: number | null
          kaphascore?: number | null
          mentoria?: string | null
          nome?: string | null
          objetivo1?: string | null
          objetivo2?: string | null
          pais?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos?: string | null
          relato_aberto?: string | null
          remedios?: string | null
          reteste_sessao_id?: string | null
          texto_ia?: string | null
          tipo?: string
          user_id?: string | null
          vatascore?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doshas_registros_reteste_sessao_id_fkey"
            columns: ["reteste_sessao_id"]
            isOneToOne: false
            referencedRelation: "reteste_sessao"
            referencedColumns: ["id"]
          },
        ]
      }
      doshas_registros2: {
        Row: {
          agniforte: number | null
          agnifraco: number | null
          agniirregular: number | null
          agniPrincipal: string | null
          agravKaphaTags: string | null
          agravPittaTags: string | null
          agravVataTags: string | null
          aliment: string | null
          alimKapha: string | null
          alimPitta: string | null
          alimVata: string | null
          altura: string | null
          conhecimentoAyurveda: string | null
          created_at: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          id: string
          idade: number | null
          idPublico: string | null
          imc: number | null
          kaphascore: number | null
          mentoria: string | null
          nome: string | null
          peso: string | null
          pittascore: number | null
          produtos: string | null
          relato_aberto: string | null
          remedios: string | null
          texto_ia: string | null
          user_id: string | null
          vatascore: number | null
        }
        Insert: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          aliment?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          id: string
          idade?: number | null
          idPublico?: string | null
          imc?: number | null
          kaphascore?: number | null
          mentoria?: string | null
          nome?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos?: string | null
          relato_aberto?: string | null
          remedios?: string | null
          texto_ia?: string | null
          user_id?: string | null
          vatascore?: number | null
        }
        Update: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          aliment?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          conhecimentoAyurveda?: string | null
          created_at?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          id?: string
          idade?: number | null
          idPublico?: string | null
          imc?: number | null
          kaphascore?: number | null
          mentoria?: string | null
          nome?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos?: string | null
          relato_aberto?: string | null
          remedios?: string | null
          texto_ia?: string | null
          user_id?: string | null
          vatascore?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doshas_registros2_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doshasbkp: {
        Row: {
          agniforte: number | null
          agnifraco: number | null
          agniirregular: number | null
          agniPrincipal: string | null
          agravKaphaTags: string | null
          agravPittaTags: string | null
          agravVataTags: string | null
          alimKapha: string | null
          alimPitta: string | null
          alimVata: string | null
          altura: string | null
          "conhecimento ayurveda": string | null
          "Created Date": string | null
          "curso-aliment": string | null
          "curso-diagno": string | null
          "curso-dravyaguna": string | null
          datateste: string | null
          diagnostico_lingua: string | null
          dicas_alimentares: string | null
          doshaprincipal: string | null
          Email: string | null
          espiritual: string | null
          ID: string | null
          idade: number | null
          idPublico: string | null
          imc: number | null
          kaphascore: number | null
          leitura_lingua: string | null
          lingua: string | null
          Local: string | null
          "mentoria-ayurveda": string | null
          nome: string | null
          'nome"_1,"produtos': string | null
          Owner: string | null
          peso: string | null
          pittascore: number | null
          produtos_samkhya: string | null
          relato_aberto: string | null
          status_analise: string | null
          "Updated Date": string | null
          vatascore: number | null
          visitorIdBrowser: string | null
          whatsapp: string | null
        }
        Insert: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          "conhecimento ayurveda"?: string | null
          "Created Date"?: string | null
          "curso-aliment"?: string | null
          "curso-diagno"?: string | null
          "curso-dravyaguna"?: string | null
          datateste?: string | null
          diagnostico_lingua?: string | null
          dicas_alimentares?: string | null
          doshaprincipal?: string | null
          Email?: string | null
          espiritual?: string | null
          ID?: string | null
          idade?: number | null
          idPublico?: string | null
          imc?: number | null
          kaphascore?: number | null
          leitura_lingua?: string | null
          lingua?: string | null
          Local?: string | null
          "mentoria-ayurveda"?: string | null
          nome?: string | null
          'nome"_1,"produtos'?: string | null
          Owner?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos_samkhya?: string | null
          relato_aberto?: string | null
          status_analise?: string | null
          "Updated Date"?: string | null
          vatascore?: number | null
          visitorIdBrowser?: string | null
          whatsapp?: string | null
        }
        Update: {
          agniforte?: number | null
          agnifraco?: number | null
          agniirregular?: number | null
          agniPrincipal?: string | null
          agravKaphaTags?: string | null
          agravPittaTags?: string | null
          agravVataTags?: string | null
          alimKapha?: string | null
          alimPitta?: string | null
          alimVata?: string | null
          altura?: string | null
          "conhecimento ayurveda"?: string | null
          "Created Date"?: string | null
          "curso-aliment"?: string | null
          "curso-diagno"?: string | null
          "curso-dravyaguna"?: string | null
          datateste?: string | null
          diagnostico_lingua?: string | null
          dicas_alimentares?: string | null
          doshaprincipal?: string | null
          Email?: string | null
          espiritual?: string | null
          ID?: string | null
          idade?: number | null
          idPublico?: string | null
          imc?: number | null
          kaphascore?: number | null
          leitura_lingua?: string | null
          lingua?: string | null
          Local?: string | null
          "mentoria-ayurveda"?: string | null
          nome?: string | null
          'nome"_1,"produtos'?: string | null
          Owner?: string | null
          peso?: string | null
          pittascore?: number | null
          produtos_samkhya?: string | null
          relato_aberto?: string | null
          status_analise?: string | null
          "Updated Date"?: string | null
          vatascore?: number | null
          visitorIdBrowser?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          contexto: Json | null
          created_at: string
          erro: string
          funcao: string
          id: string
          notificado: boolean | null
          user_id: string | null
        }
        Insert: {
          contexto?: Json | null
          created_at?: string
          erro: string
          funcao: string
          id?: string
          notificado?: boolean | null
          user_id?: string | null
        }
        Update: {
          contexto?: Json | null
          created_at?: string
          erro?: string
          funcao?: string
          id?: string
          notificado?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      escola_alunos: {
        Row: {
          aprovado_em: string | null
          aprovado_por: string | null
          cidade: string | null
          como_conheceu: string | null
          contrato_disponivel_aluno: boolean
          contrato_forma_pagamento: string | null
          contrato_observacao: string | null
          contrato_valor_total: string | null
          cpf: string | null
          created_at: string | null
          dosha_k: number | null
          dosha_p: number | null
          dosha_registro_id: string | null
          dosha_resultado: string | null
          dosha_v: number | null
          eh_bolsista: boolean | null
          email: string
          estado: string | null
          foto_url: string | null
          id: string
          matricula: string | null
          nome_completo: string
          notas_internas: string | null
          objetivo: string | null
          percentual_bolsa: number | null
          plano_descricao: string | null
          plano_pagamento: string
          status: string
          tipo: string
          turma_id: string | null
          updated_at: string | null
          user_id: string | null
          valor_mensalidade: number | null
          whatsapp: string
        }
        Insert: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          como_conheceu?: string | null
          contrato_disponivel_aluno?: boolean
          contrato_forma_pagamento?: string | null
          contrato_observacao?: string | null
          contrato_valor_total?: string | null
          cpf?: string | null
          created_at?: string | null
          dosha_k?: number | null
          dosha_p?: number | null
          dosha_registro_id?: string | null
          dosha_resultado?: string | null
          dosha_v?: number | null
          eh_bolsista?: boolean | null
          email: string
          estado?: string | null
          foto_url?: string | null
          id?: string
          matricula?: string | null
          nome_completo: string
          notas_internas?: string | null
          objetivo?: string | null
          percentual_bolsa?: number | null
          plano_descricao?: string | null
          plano_pagamento?: string
          status?: string
          tipo?: string
          turma_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_mensalidade?: number | null
          whatsapp: string
        }
        Update: {
          aprovado_em?: string | null
          aprovado_por?: string | null
          cidade?: string | null
          como_conheceu?: string | null
          contrato_disponivel_aluno?: boolean
          contrato_forma_pagamento?: string | null
          contrato_observacao?: string | null
          contrato_valor_total?: string | null
          cpf?: string | null
          created_at?: string | null
          dosha_k?: number | null
          dosha_p?: number | null
          dosha_registro_id?: string | null
          dosha_resultado?: string | null
          dosha_v?: number | null
          eh_bolsista?: boolean | null
          email?: string
          estado?: string | null
          foto_url?: string | null
          id?: string
          matricula?: string | null
          nome_completo?: string
          notas_internas?: string | null
          objetivo?: string | null
          percentual_bolsa?: number | null
          plano_descricao?: string | null
          plano_pagamento?: string
          status?: string
          tipo?: string
          turma_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_mensalidade?: number | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "escola_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_anotacoes: {
        Row: {
          aluno_id: string
          autor: string | null
          conteudo: string
          created_at: string | null
          id: string
        }
        Insert: {
          aluno_id: string
          autor?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
        }
        Update: {
          aluno_id?: string
          autor?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_anotacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_anotacoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_colegas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_avaliacao_perguntas: {
        Row: {
          created_at: string | null
          id: string
          modulo_id: string
          ordem: number | null
          pergunta: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          modulo_id: string
          ordem?: number | null
          pergunta: string
        }
        Update: {
          created_at?: string | null
          id?: string
          modulo_id?: string
          ordem?: number | null
          pergunta?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_avaliacao_perguntas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_avaliacao_respostas: {
        Row: {
          aluno_id: string
          created_at: string | null
          id: string
          pergunta_id: string
          resposta: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          id?: string
          pergunta_id: string
          resposta?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          id?: string
          pergunta_id?: string
          resposta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_avaliacao_respostas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_avaliacao_respostas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_colegas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_avaliacao_respostas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "escola_avaliacao_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_cardapio: {
        Row: {
          conteudo: string | null
          created_at: string | null
          curadoria: Json | null
          dia: string
          id: string
          modulo_id: string
          nugget_ids: string[] | null
          ordem: number | null
          refeicao: string
          updated_at: string | null
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          curadoria?: Json | null
          dia: string
          id?: string
          modulo_id: string
          nugget_ids?: string[] | null
          ordem?: number | null
          refeicao: string
          updated_at?: string | null
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          curadoria?: Json | null
          dia?: string
          id?: string
          modulo_id?: string
          nugget_ids?: string[] | null
          ordem?: number | null
          refeicao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_cardapio_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_diario: {
        Row: {
          aluno_id: string
          conteudo: string | null
          created_at: string | null
          id: string
          modulo_id: string | null
          updated_at: string | null
        }
        Insert: {
          aluno_id: string
          conteudo?: string | null
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          updated_at?: string | null
        }
        Update: {
          aluno_id?: string
          conteudo?: string | null
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_diario_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_colegas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_diario_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_modulo_materiais_alunos: {
        Row: {
          aluno_nome: string
          created_at: string
          id: string
          modulo_id: string
          storage_path: string
          tamanho_bytes: number | null
          titulo: string
          user_id: string
        }
        Insert: {
          aluno_nome: string
          created_at?: string
          id?: string
          modulo_id: string
          storage_path: string
          tamanho_bytes?: number | null
          titulo: string
          user_id: string
        }
        Update: {
          aluno_nome?: string
          created_at?: string
          id?: string
          modulo_id?: string
          storage_path?: string
          tamanho_bytes?: number | null
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      escola_modulo_recursos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          modulo_id: string
          ordem: number | null
          timestamps: Json
          tipo: string
          titulo: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          modulo_id: string
          ordem?: number | null
          timestamps?: Json
          tipo: string
          titulo: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          modulo_id?: string
          ordem?: number | null
          timestamps?: Json
          tipo?: string
          titulo?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_modulo_recursos_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_modulos: {
        Row: {
          apostila_url: string | null
          carga_horaria: number
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          liberado: boolean
          numero: number
          palette_key: string | null
          semestre: number | null
          slides_url: string | null
          slug: string | null
          tipo: string
          titulo: string
          turma_id: string | null
          video_url: string | null
          zoom_url: string | null
        }
        Insert: {
          apostila_url?: string | null
          carga_horaria: number
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          liberado?: boolean
          numero: number
          palette_key?: string | null
          semestre?: number | null
          slides_url?: string | null
          slug?: string | null
          tipo: string
          titulo: string
          turma_id?: string | null
          video_url?: string | null
          zoom_url?: string | null
        }
        Update: {
          apostila_url?: string | null
          carga_horaria?: number
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          liberado?: boolean
          numero?: number
          palette_key?: string | null
          semestre?: number | null
          slides_url?: string | null
          slug?: string | null
          tipo?: string
          titulo?: string
          turma_id?: string | null
          video_url?: string | null
          zoom_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_modulos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "escola_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_pagamentos: {
        Row: {
          aluno_id: string
          created_at: string | null
          criado_por: string | null
          data_pagamento: string | null
          id: string
          mes_referencia: string
          observacao: string | null
          status: string
          valor_esperado: number | null
          valor_pago: number | null
        }
        Insert: {
          aluno_id: string
          created_at?: string | null
          criado_por?: string | null
          data_pagamento?: string | null
          id?: string
          mes_referencia: string
          observacao?: string | null
          status?: string
          valor_esperado?: number | null
          valor_pago?: number | null
        }
        Update: {
          aluno_id?: string
          created_at?: string | null
          criado_por?: string | null
          data_pagamento?: string | null
          id?: string
          mes_referencia?: string
          observacao?: string | null
          status?: string
          valor_esperado?: number | null
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_pagamentos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_colegas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_postits: {
        Row: {
          aluno_id: string | null
          conteudo: string
          created_at: string | null
          id: string
          modulo_id: string | null
          parent_id: string | null
          turma_id: string | null
        }
        Insert: {
          aluno_id?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          parent_id?: string | null
          turma_id?: string | null
        }
        Update: {
          aluno_id?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          modulo_id?: string | null
          parent_id?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_postits_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_postits_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "escola_colegas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_postits_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_postits_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "escola_postits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escola_postits_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "escola_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_recados: {
        Row: {
          conteudo: string
          created_at: string | null
          fixado: boolean | null
          id: string
          titulo: string | null
          turma_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          fixado?: boolean | null
          id?: string
          titulo?: string | null
          turma_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          fixado?: boolean | null
          id?: string
          titulo?: string | null
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_recados_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "escola_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_turmas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          id: string
          nome: string
          vagas_total: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          nome: string
          vagas_total?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          nome?: string
          vagas_total?: number | null
        }
        Relationships: []
      }
      evolucao_classes: {
        Row: {
          min_pontos: number
          nome: string
          ordem: number
          requer_selo_terapeuta: boolean
        }
        Insert: {
          min_pontos: number
          nome: string
          ordem: number
          requer_selo_terapeuta?: boolean
        }
        Update: {
          min_pontos?: number
          nome?: string
          ordem?: number
          requer_selo_terapeuta?: boolean
        }
        Relationships: []
      }
      evolucao_eventos: {
        Row: {
          chave: string
          criado_em: string
          dia: string
          id: string
          pontos: number
          ref: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          chave: string
          criado_em?: string
          dia: string
          id?: string
          pontos: number
          ref?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          chave?: string
          criado_em?: string
          dia?: string
          id?: string
          pontos?: number
          ref?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolucao_eventos_tipo_fkey"
            columns: ["tipo"]
            isOneToOne: false
            referencedRelation: "evolucao_regras"
            referencedColumns: ["tipo"]
          },
        ]
      }
      evolucao_regras: {
        Row: {
          ativo: boolean
          cadencia: string
          descricao: string | null
          origem: string
          pontos: number
          tipo: string
        }
        Insert: {
          ativo?: boolean
          cadencia: string
          descricao?: string | null
          origem: string
          pontos: number
          tipo: string
        }
        Update: {
          ativo?: boolean
          cadencia?: string
          descricao?: string | null
          origem?: string
          pontos?: number
          tipo?: string
        }
        Relationships: []
      }
      feed_resultados: {
        Row: {
          created_at: string | null
          dosha_nome: string | null
          frase_akasha: string | null
          id: string
          nome_abreviado: string | null
          status_visual: string | null
        }
        Insert: {
          created_at?: string | null
          dosha_nome?: string | null
          frase_akasha?: string | null
          id?: string
          nome_abreviado?: string | null
          status_visual?: string | null
        }
        Update: {
          created_at?: string | null
          dosha_nome?: string | null
          frase_akasha?: string | null
          id?: string
          nome_abreviado?: string | null
          status_visual?: string | null
        }
        Relationships: []
      }
      fotos_lingua: {
        Row: {
          analise_edson: string | null
          created_at: string
          id: string
          image_url: string
          status_analise: string | null
          tags_detectadas: string[] | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          analise_edson?: string | null
          created_at?: string
          id?: string
          image_url: string
          status_analise?: string | null
          tags_detectadas?: string[] | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          analise_edson?: string | null
          created_at?: string
          id?: string
          image_url?: string
          status_analise?: string | null
          tags_detectadas?: string[] | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      glossario_doshas: {
        Row: {
          alimentosEvitar: string | null
          alimentosPriorizar: string | null
          atributos: string | null
          caminhosEquilibrio: string | null
          caracteristicasPrincipais: string | null
          "Created Date": string | null
          created_at: string
          dicasGeraisFazer: string | null
          dicasGeraisNaoFazer: string | null
          doshaNome: string
          ID: string | null
          id_sistema: string
          manifestacoesComuns: string | null
          oque: string | null
          Owner: string | null
          principaisCausas: string | null
          principaisDoencas: string | null
          receitasAyurvedicas: string | null
          remediosAyurvedicos: string | null
          rotinasEquilibrar: string | null
          rotinasInadequadas: string | null
          Title: string | null
          "Updated Date": string | null
        }
        Insert: {
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          caracteristicasPrincipais?: string | null
          "Created Date"?: string | null
          created_at?: string
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshaNome: string
          ID?: string | null
          id_sistema?: string
          manifestacoesComuns?: string | null
          oque?: string | null
          Owner?: string | null
          principaisCausas?: string | null
          principaisDoencas?: string | null
          receitasAyurvedicas?: string | null
          remediosAyurvedicos?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
          Title?: string | null
          "Updated Date"?: string | null
        }
        Update: {
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          caracteristicasPrincipais?: string | null
          "Created Date"?: string | null
          created_at?: string
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshaNome?: string
          ID?: string | null
          id_sistema?: string
          manifestacoesComuns?: string | null
          oque?: string | null
          Owner?: string | null
          principaisCausas?: string | null
          principaisDoencas?: string | null
          receitasAyurvedicas?: string | null
          remediosAyurvedicos?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
          Title?: string | null
          "Updated Date"?: string | null
        }
        Relationships: []
      }
      glossario_v2: {
        Row: {
          alimentosevitar: string | null
          alimentospriorizar: string | null
          atributos: string | null
          caminhosequilibrio: string | null
          caracteristicasprincipais: string | null
          created_at: string | null
          dicasgeraisfazer: string | null
          dicasgeraisnaofazer: string | null
          doshanome: string | null
          id: string
          manifestacoescomuns: string | null
          oque: string | null
          principaiscausas: string | null
          principaisdoencas: string | null
          receitasAyurvedicas: string | null
          remediosAyurvedicos: string | null
          rotinasequilibrar: string | null
          rotinasinadequadas: string | null
        }
        Insert: {
          alimentosevitar?: string | null
          alimentospriorizar?: string | null
          atributos?: string | null
          caminhosequilibrio?: string | null
          caracteristicasprincipais?: string | null
          created_at?: string | null
          dicasgeraisfazer?: string | null
          dicasgeraisnaofazer?: string | null
          doshanome?: string | null
          id?: string
          manifestacoescomuns?: string | null
          oque?: string | null
          principaiscausas?: string | null
          principaisdoencas?: string | null
          receitasAyurvedicas?: string | null
          remediosAyurvedicos?: string | null
          rotinasequilibrar?: string | null
          rotinasinadequadas?: string | null
        }
        Update: {
          alimentosevitar?: string | null
          alimentospriorizar?: string | null
          atributos?: string | null
          caminhosequilibrio?: string | null
          caracteristicasprincipais?: string | null
          created_at?: string | null
          dicasgeraisfazer?: string | null
          dicasgeraisnaofazer?: string | null
          doshanome?: string | null
          id?: string
          manifestacoescomuns?: string | null
          oque?: string | null
          principaiscausas?: string | null
          principaisdoencas?: string | null
          receitasAyurvedicas?: string | null
          remediosAyurvedicos?: string | null
          rotinasequilibrar?: string | null
          rotinasinadequadas?: string | null
        }
        Relationships: []
      }
      jogo_config: {
        Row: {
          chave: string
          valor: Json
        }
        Insert: {
          chave: string
          valor: Json
        }
        Update: {
          chave?: string
          valor?: Json
        }
        Relationships: []
      }
      jogo_niveis: {
        Row: {
          ativo: boolean
          desconto_pct: number
          icone: string | null
          nome: string
          ordem: number
          requisito: string | null
          tipo: string
          xp_min: number | null
        }
        Insert: {
          ativo?: boolean
          desconto_pct?: number
          icone?: string | null
          nome: string
          ordem: number
          requisito?: string | null
          tipo: string
          xp_min?: number | null
        }
        Update: {
          ativo?: boolean
          desconto_pct?: number
          icone?: string | null
          nome?: string
          ordem?: number
          requisito?: string | null
          tipo?: string
          xp_min?: number | null
        }
        Relationships: []
      }
      jogo_xp_eventos: {
        Row: {
          acao: string
          created_at: string
          email: string
          id: number
          referencia: string | null
          user_id: string | null
          xp: number
        }
        Insert: {
          acao: string
          created_at?: string
          email: string
          id?: never
          referencia?: string | null
          user_id?: string | null
          xp: number
        }
        Update: {
          acao?: string
          created_at?: string
          email?: string
          id?: never
          referencia?: string | null
          user_id?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "jogo_xp_eventos_acao_fkey"
            columns: ["acao"]
            isOneToOne: false
            referencedRelation: "jogo_xp_regras"
            referencedColumns: ["acao"]
          },
        ]
      }
      jogo_xp_regras: {
        Row: {
          acao: string
          ativo: boolean
          cap_diario: number | null
          descricao: string | null
          unidade: string
          xp: number
        }
        Insert: {
          acao: string
          ativo?: boolean
          cap_diario?: number | null
          descricao?: string | null
          unidade?: string
          xp: number
        }
        Update: {
          acao?: string
          ativo?: boolean
          cap_diario?: number | null
          descricao?: string | null
          unidade?: string
          xp?: number
        }
        Relationships: []
      }
      jornada_autodi: {
        Row: {
          "Created Date": string | null
          dataCadastro: string | null
          email: string | null
          id: number
          ID: string | null
          origem: string | null
          Owner: string | null
          Title: string | null
          "Updated Date": string | null
          whatsapp: number | null
        }
        Insert: {
          "Created Date"?: string | null
          dataCadastro?: string | null
          email?: string | null
          id?: never
          ID?: string | null
          origem?: string | null
          Owner?: string | null
          Title?: string | null
          "Updated Date"?: string | null
          whatsapp?: number | null
        }
        Update: {
          "Created Date"?: string | null
          dataCadastro?: string | null
          email?: string | null
          id?: never
          ID?: string | null
          origem?: string | null
          Owner?: string | null
          Title?: string | null
          "Updated Date"?: string | null
          whatsapp?: number | null
        }
        Relationships: []
      }
      jornada_degraus: {
        Row: {
          ativo: boolean
          cta: string | null
          id: number
          link: string | null
          ordem: number
          preco_display: string | null
          slug: string
          subtitulo: string | null
          titulo: string
          trilha: string
        }
        Insert: {
          ativo?: boolean
          cta?: string | null
          id?: never
          link?: string | null
          ordem: number
          preco_display?: string | null
          slug: string
          subtitulo?: string | null
          titulo: string
          trilha: string
        }
        Update: {
          ativo?: boolean
          cta?: string | null
          id?: never
          link?: string | null
          ordem?: number
          preco_display?: string | null
          slug?: string
          subtitulo?: string | null
          titulo?: string
          trilha?: string
        }
        Relationships: []
      }
      jornadaaliment: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      lista_email: {
        Row: {
          email: string | null
          envios: string | null
          id: number
          nome: string | null
          Sm_Advice: string | null
          Sm_EmailOriginal: string | null
          Sm_Popularidade: string | null
          Sm_Status: string | null
          whatsapp: number | null
        }
        Insert: {
          email?: string | null
          envios?: string | null
          id?: number
          nome?: string | null
          Sm_Advice?: string | null
          Sm_EmailOriginal?: string | null
          Sm_Popularidade?: string | null
          Sm_Status?: string | null
          whatsapp?: number | null
        }
        Update: {
          email?: string | null
          envios?: string | null
          id?: number
          nome?: string | null
          Sm_Advice?: string | null
          Sm_EmailOriginal?: string | null
          Sm_Popularidade?: string | null
          Sm_Status?: string | null
          whatsapp?: number | null
        }
        Relationships: []
      }
      login_eventos: {
        Row: {
          contexto: string
          criado_em: string
          email: string
          id: string
          in_app: boolean | null
          user_agent: string | null
        }
        Insert: {
          contexto: string
          criado_em?: string
          email: string
          id?: string
          in_app?: boolean | null
          user_agent?: string | null
        }
        Update: {
          contexto?: string
          criado_em?: string
          email?: string
          id?: string
          in_app?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          assunto: string
          created_at: string
          email: string
          enviado_em: string | null
          enviado_por: string | null
          id: string
          mensagem: string
          nome: string
          resposta_admin: string | null
          resposta_enviada: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assunto: string
          created_at?: string
          email: string
          enviado_em?: string | null
          enviado_por?: string | null
          id?: string
          mensagem: string
          nome: string
          resposta_admin?: string | null
          resposta_enviada?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assunto?: string
          created_at?: string
          email?: string
          enviado_em?: string | null
          enviado_por?: string | null
          id?: string
          mensagem?: string
          nome?: string
          resposta_admin?: string | null
          resposta_enviada?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      metricas_index: {
        Row: {
          akasha_hoje: number | null
          atualizado_em: string | null
          data_referencia: string | null
          dosha_agravando: string | null
          dosha_agravando_pct: number | null
          dosha_aliviando: string | null
          dosha_aliviando_pct: number | null
          estacao: string | null
          frase_nugget: string | null
          historico_frases: Json | null
          id: number
          idade_kapha: number | null
          idade_pitta: number | null
          idade_vata: number | null
          imc_kapha: number | null
          imc_pitta: number | null
          imc_vata: number | null
          pct_kapha_dom: number | null
          pct_pitta_dom: number | null
          pct_vata_dom: number | null
          periodo_estacao: string | null
          set_ativo: number | null
          sintoma_kapha: string | null
          sintoma_pitta: string | null
          sintoma_vata: string | null
          terapeutas: number | null
          testes_7d: number | null
          var_kapha: number | null
          var_pitta: number | null
          var_vata: number | null
        }
        Insert: {
          akasha_hoje?: number | null
          atualizado_em?: string | null
          data_referencia?: string | null
          dosha_agravando?: string | null
          dosha_agravando_pct?: number | null
          dosha_aliviando?: string | null
          dosha_aliviando_pct?: number | null
          estacao?: string | null
          frase_nugget?: string | null
          historico_frases?: Json | null
          id?: number
          idade_kapha?: number | null
          idade_pitta?: number | null
          idade_vata?: number | null
          imc_kapha?: number | null
          imc_pitta?: number | null
          imc_vata?: number | null
          pct_kapha_dom?: number | null
          pct_pitta_dom?: number | null
          pct_vata_dom?: number | null
          periodo_estacao?: string | null
          set_ativo?: number | null
          sintoma_kapha?: string | null
          sintoma_pitta?: string | null
          sintoma_vata?: string | null
          terapeutas?: number | null
          testes_7d?: number | null
          var_kapha?: number | null
          var_pitta?: number | null
          var_vata?: number | null
        }
        Update: {
          akasha_hoje?: number | null
          atualizado_em?: string | null
          data_referencia?: string | null
          dosha_agravando?: string | null
          dosha_agravando_pct?: number | null
          dosha_aliviando?: string | null
          dosha_aliviando_pct?: number | null
          estacao?: string | null
          frase_nugget?: string | null
          historico_frases?: Json | null
          id?: number
          idade_kapha?: number | null
          idade_pitta?: number | null
          idade_vata?: number | null
          imc_kapha?: number | null
          imc_pitta?: number | null
          imc_vata?: number | null
          pct_kapha_dom?: number | null
          pct_pitta_dom?: number | null
          pct_vata_dom?: number | null
          periodo_estacao?: string | null
          set_ativo?: number | null
          sintoma_kapha?: string | null
          sintoma_pitta?: string | null
          sintoma_vata?: string | null
          terapeutas?: number | null
          testes_7d?: number | null
          var_kapha?: number | null
          var_pitta?: number | null
          var_vata?: number | null
        }
        Relationships: []
      }
      metricas_snapshot: {
        Row: {
          categoria: string
          data_calculo: string
          descricao: string
          familia: string
          id: number
          metrica_id: string
          n_base: number | null
          percentual: number | null
          updated_at: string | null
        }
        Insert: {
          categoria: string
          data_calculo: string
          descricao: string
          familia: string
          id?: number
          metrica_id: string
          n_base?: number | null
          percentual?: number | null
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          data_calculo?: string
          descricao?: string
          familia?: string
          id?: number
          metrica_id?: string
          n_base?: number | null
          percentual?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      n8n_backups: {
        Row: {
          arquivo_nome: string
          created_at: string
          hash: string
          id: string
          total_workflows: number
        }
        Insert: {
          arquivo_nome: string
          created_at?: string
          hash: string
          id?: string
          total_workflows: number
        }
        Update: {
          arquivo_nome?: string
          created_at?: string
          hash?: string
          id?: string
          total_workflows?: number
        }
        Relationships: []
      }
      n8n_webhooks: {
        Row: {
          ativo: boolean
          connections_json: Json | null
          criado_em: string
          descricao: string | null
          execucoes_erro: number
          execucoes_sucesso: number
          funcao: string | null
          id: string
          nodes_json: Json | null
          notas: string | null
          sincronizado_em: string
          tags: string[] | null
          taxa_sucesso: number | null
          total_execucoes: number
          ultima_atualizacao_n8n: string | null
          ultima_execucao: string | null
          webhook_method: string | null
          webhook_path: string | null
          webhook_tipo: string | null
          webhook_url: string | null
          workflow_ativo: boolean
          workflow_id: string
          workflow_name: string
        }
        Insert: {
          ativo?: boolean
          connections_json?: Json | null
          criado_em: string
          descricao?: string | null
          execucoes_erro?: number
          execucoes_sucesso?: number
          funcao?: string | null
          id?: string
          nodes_json?: Json | null
          notas?: string | null
          sincronizado_em?: string
          tags?: string[] | null
          taxa_sucesso?: number | null
          total_execucoes?: number
          ultima_atualizacao_n8n?: string | null
          ultima_execucao?: string | null
          webhook_method?: string | null
          webhook_path?: string | null
          webhook_tipo?: string | null
          webhook_url?: string | null
          workflow_ativo?: boolean
          workflow_id: string
          workflow_name: string
        }
        Update: {
          ativo?: boolean
          connections_json?: Json | null
          criado_em?: string
          descricao?: string | null
          execucoes_erro?: number
          execucoes_sucesso?: number
          funcao?: string | null
          id?: string
          nodes_json?: Json | null
          notas?: string | null
          sincronizado_em?: string
          tags?: string[] | null
          taxa_sucesso?: number | null
          total_execucoes?: number
          ultima_atualizacao_n8n?: string | null
          ultima_execucao?: string | null
          webhook_method?: string | null
          webhook_path?: string | null
          webhook_tipo?: string | null
          webhook_url?: string | null
          workflow_ativo?: boolean
          workflow_id?: string
          workflow_name?: string
        }
        Relationships: []
      }
      n8n_webhooks_history: {
        Row: {
          funcao: string | null
          id: string
          node_types: string[] | null
          nodes_count: number | null
          snapshot_em: string
          ultima_atualizacao_n8n: string | null
          webhook_method: string | null
          webhook_path: string | null
          webhook_tipo: string | null
          webhook_url: string | null
          workflow_ativo: boolean
          workflow_id: string
          workflow_name: string
        }
        Insert: {
          funcao?: string | null
          id?: string
          node_types?: string[] | null
          nodes_count?: number | null
          snapshot_em?: string
          ultima_atualizacao_n8n?: string | null
          webhook_method?: string | null
          webhook_path?: string | null
          webhook_tipo?: string | null
          webhook_url?: string | null
          workflow_ativo?: boolean
          workflow_id: string
          workflow_name: string
        }
        Update: {
          funcao?: string | null
          id?: string
          node_types?: string[] | null
          nodes_count?: number | null
          snapshot_em?: string
          ultima_atualizacao_n8n?: string | null
          webhook_method?: string | null
          webhook_path?: string | null
          webhook_tipo?: string | null
          webhook_url?: string | null
          workflow_ativo?: boolean
          workflow_id?: string
          workflow_name?: string
        }
        Relationships: []
      }
      niveis: {
        Row: {
          descricao: string | null
          marco: string
          nome: string
          tier: number
        }
        Insert: {
          descricao?: string | null
          marco: string
          nome: string
          tier: number
        }
        Update: {
          descricao?: string | null
          marco?: string
          nome?: string
          tier?: number
        }
        Relationships: []
      }
      perfis: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      plano_30_dias: {
        Row: {
          data_criacao: string | null
          data_fim: string | null
          data_inicio: string | null
          dias_completados: number | null
          distribuicao_categoria: Json | null
          distribuicao_dificuldade: Json | null
          distribuicao_pilar: Json | null
          id: string
          objetivo_tratamento_id: string | null
          percentual_conclusao: number | null
          plano_json: Json
          status: string | null
          total_dias: number | null
          total_dicas_usadas: number | null
          user_email: string
        }
        Insert: {
          data_criacao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_completados?: number | null
          distribuicao_categoria?: Json | null
          distribuicao_dificuldade?: Json | null
          distribuicao_pilar?: Json | null
          id?: string
          objetivo_tratamento_id?: string | null
          percentual_conclusao?: number | null
          plano_json: Json
          status?: string | null
          total_dias?: number | null
          total_dicas_usadas?: number | null
          user_email: string
        }
        Update: {
          data_criacao?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_completados?: number | null
          distribuicao_categoria?: Json | null
          distribuicao_dificuldade?: Json | null
          distribuicao_pilar?: Json | null
          id?: string
          objetivo_tratamento_id?: string | null
          percentual_conclusao?: number | null
          plano_json?: Json
          status?: string | null
          total_dias?: number | null
          total_dicas_usadas?: number | null
          user_email?: string
        }
        Relationships: []
      }
      portal_ajuda: {
        Row: {
          assunto: string
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          id: string
          link: string | null
          ordem: number | null
          palavras_chave: string | null
          resposta_curta: string
          updated_at: string | null
        }
        Insert: {
          assunto: string
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          ordem?: number | null
          palavras_chave?: string | null
          resposta_curta: string
          updated_at?: string | null
        }
        Update: {
          assunto?: string
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          ordem?: number | null
          palavras_chave?: string | null
          resposta_curta?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      portal_conteudo: {
        Row: {
          created_at: string
          destaque_index: boolean | null
          destaque_ordem: number | null
          id: string
          image_url: string | null
          link_do_artigo: string | null
          meta_description: string | null
          status: string | null
          summary: string | null
          tags: string | null
          timestamps: Json | null
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          destaque_index?: boolean | null
          destaque_ordem?: number | null
          id?: string
          image_url?: string | null
          link_do_artigo?: string | null
          meta_description?: string | null
          status?: string | null
          summary?: string | null
          tags?: string | null
          timestamps?: Json | null
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          destaque_index?: boolean | null
          destaque_ordem?: number | null
          id?: string
          image_url?: string | null
          link_do_artigo?: string | null
          meta_description?: string | null
          status?: string | null
          summary?: string | null
          tags?: string | null
          timestamps?: Json | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      portal_devlog: {
        Row: {
          acesso_permitido: string[] | null
          agente_ativo: boolean | null
          agente_system_prompt: string | null
          agente_webhook: string | null
          arquivos_relevantes: string[] | null
          created_at: string | null
          decisoes: Json | null
          depende_de: string[] | null
          descricao: string | null
          hipotese: string | null
          id: string
          impacta: string[] | null
          log_atividade: Json | null
          modo_acesso: string | null
          modulo: string
          notas: Json | null
          notas_tecnicas: Json | null
          perfis: string[] | null
          proposto_pelo_agente: Json | null
          proximos_passos: string | null
          seguranca: Json | null
          stack: string[] | null
          status: Database["public"]["Enums"]["devlog_status"]
          submodulo: string | null
          tabelas_relacionadas: string[] | null
          tags: string[] | null
          tipo: Database["public"]["Enums"]["devlog_tipo"]
          titulo: string
          ultima_atualizacao: string | null
          updated_at: string | null
          versao: string | null
          vertical: string | null
        }
        Insert: {
          acesso_permitido?: string[] | null
          agente_ativo?: boolean | null
          agente_system_prompt?: string | null
          agente_webhook?: string | null
          arquivos_relevantes?: string[] | null
          created_at?: string | null
          decisoes?: Json | null
          depende_de?: string[] | null
          descricao?: string | null
          hipotese?: string | null
          id?: string
          impacta?: string[] | null
          log_atividade?: Json | null
          modo_acesso?: string | null
          modulo: string
          notas?: Json | null
          notas_tecnicas?: Json | null
          perfis?: string[] | null
          proposto_pelo_agente?: Json | null
          proximos_passos?: string | null
          seguranca?: Json | null
          stack?: string[] | null
          status?: Database["public"]["Enums"]["devlog_status"]
          submodulo?: string | null
          tabelas_relacionadas?: string[] | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["devlog_tipo"]
          titulo: string
          ultima_atualizacao?: string | null
          updated_at?: string | null
          versao?: string | null
          vertical?: string | null
        }
        Update: {
          acesso_permitido?: string[] | null
          agente_ativo?: boolean | null
          agente_system_prompt?: string | null
          agente_webhook?: string | null
          arquivos_relevantes?: string[] | null
          created_at?: string | null
          decisoes?: Json | null
          depende_de?: string[] | null
          descricao?: string | null
          hipotese?: string | null
          id?: string
          impacta?: string[] | null
          log_atividade?: Json | null
          modo_acesso?: string | null
          modulo?: string
          notas?: Json | null
          notas_tecnicas?: Json | null
          perfis?: string[] | null
          proposto_pelo_agente?: Json | null
          proximos_passos?: string | null
          seguranca?: Json | null
          stack?: string[] | null
          status?: Database["public"]["Enums"]["devlog_status"]
          submodulo?: string | null
          tabelas_relacionadas?: string[] | null
          tags?: string[] | null
          tipo?: Database["public"]["Enums"]["devlog_tipo"]
          titulo?: string
          ultima_atualizacao?: string | null
          updated_at?: string | null
          versao?: string | null
          vertical?: string | null
        }
        Relationships: []
      }
      portal_dicas: {
        Row: {
          Acao_Pratica: string
          Categoria: string
          created_at: string
          Dificuldade: string
          Explicacao: string
          id: number
          Pilar: string
          Tags_de_Agravamento: string
        }
        Insert: {
          Acao_Pratica: string
          Categoria: string
          created_at?: string
          Dificuldade: string
          Explicacao: string
          id?: number
          Pilar: string
          Tags_de_Agravamento: string
        }
        Update: {
          Acao_Pratica?: string
          Categoria?: string
          created_at?: string
          Dificuldade?: string
          Explicacao?: string
          id?: number
          Pilar?: string
          Tags_de_Agravamento?: string
        }
        Relationships: []
      }
      portal_glossario: {
        Row: {
          alertas_cotidianos: Json | null
          alimentosEvitar: string | null
          alimentosPriorizar: string | null
          atributos: string | null
          caminhosEquilibrio: string | null
          desequilibrio: string | null
          dicasGeraisFazer: string | null
          dicasGeraisNaoFazer: string | null
          doshanome: string | null
          equilibrio: string | null
          frase_clinica: string | null
          habitos_diarios: Json | null
          id: number
          kit_recomendado_slug: string | null
          oque: string | null
          principaiscausas: string | null
          principaisDoencas: string | null
          produto_primario_slug: string | null
          resumo_curto: string | null
          rotinasEquilibrar: string | null
          rotinasInadequadas: string | null
        }
        Insert: {
          alertas_cotidianos?: Json | null
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          desequilibrio?: string | null
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshanome?: string | null
          equilibrio?: string | null
          frase_clinica?: string | null
          habitos_diarios?: Json | null
          id: number
          kit_recomendado_slug?: string | null
          oque?: string | null
          principaiscausas?: string | null
          principaisDoencas?: string | null
          produto_primario_slug?: string | null
          resumo_curto?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
        }
        Update: {
          alertas_cotidianos?: Json | null
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          desequilibrio?: string | null
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshanome?: string | null
          equilibrio?: string | null
          frase_clinica?: string | null
          habitos_diarios?: Json | null
          id?: number
          kit_recomendado_slug?: string | null
          oque?: string | null
          principaiscausas?: string | null
          principaisDoencas?: string | null
          produto_primario_slug?: string | null
          resumo_curto?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
        }
        Relationships: []
      }
      portal_graficos: {
        Row: {
          atualizado_em: string | null
          dados: Json
          grafico_id: string
          grupo: string | null
          id: number
          ordem: number | null
          subtitulo: string | null
          tipo_grafico: string
          titulo: string
        }
        Insert: {
          atualizado_em?: string | null
          dados: Json
          grafico_id: string
          grupo?: string | null
          id?: number
          ordem?: number | null
          subtitulo?: string | null
          tipo_grafico: string
          titulo: string
        }
        Update: {
          atualizado_em?: string | null
          dados?: Json
          grafico_id?: string
          grupo?: string | null
          id?: number
          ordem?: number | null
          subtitulo?: string | null
          tipo_grafico?: string
          titulo?: string
        }
        Relationships: []
      }
      portal_kapha: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      portal_lives: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      portal_oficial: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      portal_pitta: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      portal_receitas: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      portal_terapeutas: {
        Row: {
          cidade: string | null
          "created date": string | null
          email: string | null
          especialidade: string | null
          estado: string | null
          formado_desde: number | null
          id: string
          imagem: string | null
          "imagem.1": string | null
          instagram: string | null
          nome: string | null
          owner: string | null
          pais: string | null
          resumo: string | null
          status: string | null
          "terapeutas(dinamica)": string | null
          title: string | null
          "updated date": string | null
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          cidade?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formado_desde?: number | null
          id?: string
          imagem?: string | null
          "imagem.1"?: string | null
          instagram?: string | null
          nome?: string | null
          owner?: string | null
          pais?: string | null
          resumo?: string | null
          status?: string | null
          "terapeutas(dinamica)"?: string | null
          title?: string | null
          "updated date"?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          cidade?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formado_desde?: number | null
          id?: string
          imagem?: string | null
          "imagem.1"?: string | null
          instagram?: string | null
          nome?: string | null
          owner?: string | null
          pais?: string | null
          resumo?: string | null
          status?: string | null
          "terapeutas(dinamica)"?: string | null
          title?: string | null
          "updated date"?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      portal_termos_canonicos: {
        Row: {
          ativo: boolean
          canonico: string
          id: number
          link: string
          tipo: string
          variante: string
        }
        Insert: {
          ativo?: boolean
          canonico: string
          id?: never
          link: string
          tipo?: string
          variante: string
        }
        Update: {
          ativo?: boolean
          canonico?: string
          id?: never
          link?: string
          tipo?: string
          variante?: string
        }
        Relationships: []
      }
      portal_vata: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      recepcionista_memoria: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      registroakashikobkp: {
        Row: {
          "Created Date": string | null
          data: string | null
          emailFonte: string | null
          ID: string | null
          Owner: string | null
          "Registro de Akasha": string | null
          "Registros Akashikos": string | null
          resumo: string | null
          tags: string | null
          tags_registro: string | null
          titulo: string | null
          "Updated Date": string | null
        }
        Insert: {
          "Created Date"?: string | null
          data?: string | null
          emailFonte?: string | null
          ID?: string | null
          Owner?: string | null
          "Registro de Akasha"?: string | null
          "Registros Akashikos"?: string | null
          resumo?: string | null
          tags?: string | null
          tags_registro?: string | null
          titulo?: string | null
          "Updated Date"?: string | null
        }
        Update: {
          "Created Date"?: string | null
          data?: string | null
          emailFonte?: string | null
          ID?: string | null
          Owner?: string | null
          "Registro de Akasha"?: string | null
          "Registros Akashikos"?: string | null
          resumo?: string | null
          tags?: string | null
          tags_registro?: string | null
          titulo?: string | null
          "Updated Date"?: string | null
        }
        Relationships: []
      }
      reteste_chat_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          mapa_resposta: Json | null
          role: string
          sessao_id: string
          sinal_emitido: Json | null
          subsecao: string | null
          user_email: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          mapa_resposta?: Json | null
          role: string
          sessao_id: string
          sinal_emitido?: Json | null
          subsecao?: string | null
          user_email: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          mapa_resposta?: Json | null
          role?: string
          sessao_id?: string
          sinal_emitido?: Json | null
          subsecao?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "reteste_chat_history_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "reteste_sessao"
            referencedColumns: ["id"]
          },
        ]
      }
      reteste_sessao: {
        Row: {
          created_at: string | null
          direcao_check_in: string | null
          dosha_registro_origem_id: string | null
          id: string
          momento: number
          pack_perguntas: Json | null
          perguntas_subsecao: number
          questao_atual: number
          relato_abertura: string | null
          respostas_raw: Json | null
          resultado: Json | null
          seed: Json
          sinais_agni: number
          sinais_kapha: number
          sinais_pitta: number
          sinais_vata: number
          status: string
          subsecao: string | null
          total_sinais: number
          updated_at: string | null
          user_email: string
        }
        Insert: {
          created_at?: string | null
          direcao_check_in?: string | null
          dosha_registro_origem_id?: string | null
          id?: string
          momento?: number
          pack_perguntas?: Json | null
          perguntas_subsecao?: number
          questao_atual?: number
          relato_abertura?: string | null
          respostas_raw?: Json | null
          resultado?: Json | null
          seed?: Json
          sinais_agni?: number
          sinais_kapha?: number
          sinais_pitta?: number
          sinais_vata?: number
          status?: string
          subsecao?: string | null
          total_sinais?: number
          updated_at?: string | null
          user_email: string
        }
        Update: {
          created_at?: string | null
          direcao_check_in?: string | null
          dosha_registro_origem_id?: string | null
          id?: string
          momento?: number
          pack_perguntas?: Json | null
          perguntas_subsecao?: number
          questao_atual?: number
          relato_abertura?: string | null
          respostas_raw?: Json | null
          resultado?: Json | null
          seed?: Json
          sinais_agni?: number
          sinais_kapha?: number
          sinais_pitta?: number
          sinais_vata?: number
          status?: string
          subsecao?: string | null
          total_sinais?: number
          updated_at?: string | null
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "reteste_sessao_dosha_registro_origem_id_fkey"
            columns: ["dosha_registro_origem_id"]
            isOneToOne: false
            referencedRelation: "doshas_registros"
            referencedColumns: ["id"]
          },
        ]
      }
      rotina_acoes: {
        Row: {
          anti_kapha: number | null
          anti_pitta: number | null
          anti_vata: number | null
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          duracao: string | null
          importancia: string | null
          periodo_dia: string | null
          pilar: string | null
          playlist: string
          pode_repetir: boolean | null
          receita_json: Json | null
          revisado: boolean | null
          tem_receita: boolean | null
          titulo: string
          url: string
          video_id: string
        }
        Insert: {
          anti_kapha?: number | null
          anti_pitta?: number | null
          anti_vata?: number | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao?: string | null
          importancia?: string | null
          periodo_dia?: string | null
          pilar?: string | null
          playlist: string
          pode_repetir?: boolean | null
          receita_json?: Json | null
          revisado?: boolean | null
          tem_receita?: boolean | null
          titulo: string
          url: string
          video_id: string
        }
        Update: {
          anti_kapha?: number | null
          anti_pitta?: number | null
          anti_vata?: number | null
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao?: string | null
          importancia?: string | null
          periodo_dia?: string | null
          pilar?: string | null
          playlist?: string
          pode_repetir?: boolean | null
          receita_json?: Json | null
          revisado?: boolean | null
          tem_receita?: boolean | null
          titulo?: string
          url?: string
          video_id?: string
        }
        Relationships: []
      }
      rotina_extracao_fila: {
        Row: {
          arquivo: string | null
          created_at: string | null
          doc_id_antes: number | null
          doc_id_central: number
          doc_id_depois: number | null
          erro: string | null
          id: number
          nuggets_extraidos: number | null
          processado: boolean | null
          qualificado: boolean | null
          topico: string | null
          video_id_extraido: string | null
        }
        Insert: {
          arquivo?: string | null
          created_at?: string | null
          doc_id_antes?: number | null
          doc_id_central: number
          doc_id_depois?: number | null
          erro?: string | null
          id?: number
          nuggets_extraidos?: number | null
          processado?: boolean | null
          qualificado?: boolean | null
          topico?: string | null
          video_id_extraido?: string | null
        }
        Update: {
          arquivo?: string | null
          created_at?: string | null
          doc_id_antes?: number | null
          doc_id_central?: number
          doc_id_depois?: number | null
          erro?: string | null
          id?: number
          nuggets_extraidos?: number | null
          processado?: boolean | null
          qualificado?: boolean | null
          topico?: string | null
          video_id_extraido?: string | null
        }
        Relationships: []
      }
      rotina_favoritos: {
        Row: {
          created_at: string
          nugget_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          nugget_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          nugget_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotina_favoritos_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotina_favoritos_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "v_receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotina_nuggets: {
        Row: {
          categoria: string | null
          chunk_index: number | null
          created_at: string | null
          icone_lucide: string | null
          id: string
          imagem_prompt: string | null
          imagem_url: string | null
          kapha: number | null
          nugget_json: Json | null
          periodo: string | null
          pitta: number | null
          revisado: boolean | null
          score: number | null
          slug: string | null
          subcategoria: string | null
          tags: string[] | null
          tipo: string | null
          titulo: string
          uso_externo: boolean | null
          vata: number | null
          video_id: string | null
          video_timestamp: string | null
        }
        Insert: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string
          imagem_prompt?: string | null
          imagem_url?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          slug?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo: string
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Update: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string
          imagem_prompt?: string | null
          imagem_url?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          slug?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Relationships: []
      }
      rotina_nuggets_backup_20260617: {
        Row: {
          categoria: string | null
          chunk_index: number | null
          created_at: string | null
          icone_lucide: string | null
          id: string | null
          kapha: number | null
          nugget_json: Json | null
          periodo: string | null
          pitta: number | null
          revisado: boolean | null
          score: number | null
          subcategoria: string | null
          tags: string[] | null
          tipo: string | null
          titulo: string | null
          uso_externo: boolean | null
          vata: number | null
          video_id: string | null
          video_timestamp: string | null
        }
        Insert: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string | null
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Update: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string | null
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Relationships: []
      }
      rotina_nuggets_backup_jun17: {
        Row: {
          categoria: string | null
          chunk_index: number | null
          created_at: string | null
          icone_lucide: string | null
          id: string | null
          kapha: number | null
          nugget_json: Json | null
          periodo: string | null
          pitta: number | null
          revisado: boolean | null
          score: number | null
          subcategoria: string | null
          tags: string[] | null
          tipo: string | null
          titulo: string | null
          uso_externo: boolean | null
          vata: number | null
          video_id: string | null
          video_timestamp: string | null
        }
        Insert: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string | null
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Update: {
          categoria?: string | null
          chunk_index?: number | null
          created_at?: string | null
          icone_lucide?: string | null
          id?: string | null
          kapha?: number | null
          nugget_json?: Json | null
          periodo?: string | null
          pitta?: number | null
          revisado?: boolean | null
          score?: number | null
          subcategoria?: string | null
          tags?: string[] | null
          tipo?: string | null
          titulo?: string | null
          uso_externo?: boolean | null
          vata?: number | null
          video_id?: string | null
          video_timestamp?: string | null
        }
        Relationships: []
      }
      rotina_pontos: {
        Row: {
          created_at: string
          data: string
          id: string
          nugget_id: string | null
          pontos: number
          referencia: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          nugget_id?: string | null
          pontos: number
          referencia?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          nugget_id?: string | null
          pontos?: number
          referencia?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rotina_pontos_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotina_pontos_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "v_receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      rotinas_usuario: {
        Row: {
          created_at: string | null
          dia: number
          id: string
          nugget_id: string | null
          praticado: boolean
          slot: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dia: number
          id?: string
          nugget_id?: string | null
          praticado?: boolean
          slot: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dia?: number
          id?: string
          nugget_id?: string | null
          praticado?: boolean
          slot?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rotinas_usuario_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotinas_usuario_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "v_receitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotinas_usuario_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "doshas_registros"
            referencedColumns: ["id"]
          },
        ]
      }
      samkhya: {
        Row: {
          content: string | null
          "Efeitos esperados": string | null
          embedding: string | null
          id: number
          imagem_url: string | null
          Indicações: string | null
          Ingredientes: string | null
          "O que é": string | null
          "Outros/curiosidade": string | null
          Posologia: string | null
          Produto: string | null
          resumo_curto: string | null
          tags_propriedades: string[] | null
        }
        Insert: {
          content?: string | null
          "Efeitos esperados"?: string | null
          embedding?: string | null
          id?: number
          imagem_url?: string | null
          Indicações?: string | null
          Ingredientes?: string | null
          "O que é"?: string | null
          "Outros/curiosidade"?: string | null
          Posologia?: string | null
          Produto?: string | null
          resumo_curto?: string | null
          tags_propriedades?: string[] | null
        }
        Update: {
          content?: string | null
          "Efeitos esperados"?: string | null
          embedding?: string | null
          id?: number
          imagem_url?: string | null
          Indicações?: string | null
          Ingredientes?: string | null
          "O que é"?: string | null
          "Outros/curiosidade"?: string | null
          Posologia?: string | null
          Produto?: string | null
          resumo_curto?: string | null
          tags_propriedades?: string[] | null
        }
        Relationships: []
      }
      tags_alias: {
        Row: {
          alias: string
          tag_slug: string
        }
        Insert: {
          alias: string
          tag_slug: string
        }
        Update: {
          alias?: string
          tag_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_alias_tag_slug_fkey"
            columns: ["tag_slug"]
            isOneToOne: false
            referencedRelation: "tags_canonicas"
            referencedColumns: ["slug"]
          },
        ]
      }
      tags_canonicas: {
        Row: {
          dosha: string | null
          emoji: string
          nome: string
          ordem: number
          slug: string
        }
        Insert: {
          dosha?: string | null
          emoji?: string
          nome: string
          ordem?: number
          slug: string
        }
        Update: {
          dosha?: string | null
          emoji?: string
          nome?: string
          ordem?: number
          slug?: string
        }
        Relationships: []
      }
      testededosha: {
        Row: {
          created_at: string | null
          embedding: string | null
          explicacao: string | null
          id: string
          opcoes_pontuadas: Json | null
          original: string | null
          pergunta_identificada: string | null
          pergunta_texto: string | null
          profundidade: string | null
          qualidade_reteste: string | null
          tag: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          explicacao?: string | null
          id?: string
          opcoes_pontuadas?: Json | null
          original?: string | null
          pergunta_identificada?: string | null
          pergunta_texto?: string | null
          profundidade?: string | null
          qualidade_reteste?: string | null
          tag?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          explicacao?: string | null
          id?: string
          opcoes_pontuadas?: Json | null
          original?: string | null
          pergunta_identificada?: string | null
          pergunta_texto?: string | null
          profundidade?: string | null
          qualidade_reteste?: string | null
          tag?: string | null
        }
        Relationships: []
      }
      user_content_views: {
        Row: {
          content_id: string
          content_type: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          content_id: string
          content_type: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          content_id?: string
          content_type?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          cupom_id: string | null
          email: string
          endereco: Json | null
          id: string
          is_cortesia: boolean | null
          is_premium: boolean | null
          nivel_evolucao: string
          nome: string | null
          nome_completo: string | null
          plano: string | null
          pontos_ojas: number
          premium_since: string | null
          premium_until: string | null
          streak_atual: number
          streak_recorde: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          telefone: string | null
          tokens_akasha: number
          ultimo_dia_ativo: string | null
          visitor_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          cupom_id?: string | null
          email: string
          endereco?: Json | null
          id: string
          is_cortesia?: boolean | null
          is_premium?: boolean | null
          nivel_evolucao?: string
          nome?: string | null
          nome_completo?: string | null
          plano?: string | null
          pontos_ojas?: number
          premium_since?: string | null
          premium_until?: string | null
          streak_atual?: number
          streak_recorde?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telefone?: string | null
          tokens_akasha?: number
          ultimo_dia_ativo?: string | null
          visitor_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          cupom_id?: string | null
          email?: string
          endereco?: Json | null
          id?: string
          is_cortesia?: boolean | null
          is_premium?: boolean | null
          nivel_evolucao?: string
          nome?: string | null
          nome_completo?: string | null
          plano?: string | null
          pontos_ojas?: number
          premium_since?: string | null
          premium_until?: string | null
          streak_atual?: number
          streak_recorde?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          telefone?: string | null
          tokens_akasha?: number
          ultimo_dia_ativo?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_salvos: {
        Row: {
          conteudo: string | null
          created_at: string
          id: number
          referencia: string
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string
          id?: never
          referencia: string
          tipo: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string
          id?: never
          referencia?: string
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      videos_seo: {
        Row: {
          criado_em: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      videos_seo2: {
        Row: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          slug: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          slug?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          embedding?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          slug?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
      videos_seo3: {
        Row: {
          criado_em: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          legenda?: string | null
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          status?: string | null
          tags?: string | null
          texto_para_embedding?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      arquitetura_saude: {
        Row: {
          categoria: string | null
          n_tabelas: number | null
          status_saude: string | null
        }
        Relationships: []
      }
      arquitetura_tabela_fluxos: {
        Row: {
          categoria: string | null
          fluxos_que_passam: string[] | null
          linhas: number | null
          n_fluxos: number | null
          schema_nome: string | null
          status_saude: string | null
          tabela: string | null
        }
        Relationships: []
      }
      conteudo_tagged: {
        Row: {
          id: string | null
          imagem: string | null
          publicado_em: string | null
          rota: string | null
          tags: string[] | null
          tipo: string | null
          titulo: string | null
        }
        Relationships: []
      }
      curso_aulas_indice: {
        Row: {
          duracao_segundos: number | null
          id: string | null
          modulo_id: string | null
          ordem: number | null
          titulo: string | null
        }
        Insert: {
          duracao_segundos?: number | null
          id?: string | null
          modulo_id?: string | null
          ordem?: number | null
          titulo?: string | null
        }
        Update: {
          duracao_segundos?: number | null
          id?: string | null
          modulo_id?: string | null
          ordem?: number | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_aulas_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "curso_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_colegas: {
        Row: {
          cidade: string | null
          estado: string | null
          foto_url: string | null
          id: string | null
          nome_completo: string | null
          turma_id: string | null
        }
        Insert: {
          cidade?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          nome_completo?: string | null
          turma_id?: string | null
        }
        Update: {
          cidade?: string | null
          estado?: string | null
          foto_url?: string | null
          id?: string | null
          nome_completo?: string | null
          turma_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "escola_turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      login_funil_diario: {
        Row: {
          contexto: string | null
          dia: string | null
          emails: number | null
          envios: number | null
          in_app: boolean | null
          logaram_24h: number | null
        }
        Relationships: []
      }
      sitemap_urls: {
        Row: {
          lastmod: string | null
          prio: number | null
          rota: string | null
        }
        Relationships: []
      }
      v_receitas: {
        Row: {
          dicas: string | null
          dravya_guna: Json | null
          efeito_esperado: string | null
          icone: string | null
          id: string | null
          imagem_prompt: string | null
          imagem_url: string | null
          ingredientes: Json | null
          kapha: number | null
          modo_preparo: Json | null
          pitta: number | null
          resumo: string | null
          slug: string | null
          subcategoria: string | null
          tags: string[] | null
          titulo: string | null
          vata: number | null
        }
        Insert: {
          dicas?: never
          dravya_guna?: never
          efeito_esperado?: never
          icone?: never
          id?: string | null
          imagem_prompt?: string | null
          imagem_url?: string | null
          ingredientes?: never
          kapha?: number | null
          modo_preparo?: never
          pitta?: number | null
          resumo?: never
          slug?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          titulo?: never
          vata?: number | null
        }
        Update: {
          dicas?: never
          dravya_guna?: never
          efeito_esperado?: never
          icone?: never
          id?: string | null
          imagem_prompt?: string | null
          imagem_url?: string | null
          ingredientes?: never
          kapha?: number | null
          modo_preparo?: never
          pitta?: number | null
          resumo?: never
          slug?: string | null
          subcategoria?: string | null
          tags?: string[] | null
          titulo?: never
          vata?: number | null
        }
        Relationships: []
      }
      videos_canonicos: {
        Row: {
          criado_em: string | null
          is_live: boolean | null
          is_oficial: boolean | null
          is_receita: boolean | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          slug: string | null
          tags: string | null
          titulo_original: string | null
          url: string | null
          video_id: string | null
        }
        Insert: {
          criado_em?: string | null
          is_live?: never
          is_oficial?: never
          is_receita?: never
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          slug?: string | null
          tags?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string | null
        }
        Update: {
          criado_em?: string | null
          is_live?: never
          is_oficial?: never
          is_receita?: never
          mini_resumo?: string | null
          nova_descricao?: string | null
          novo_titulo?: string | null
          slug?: string | null
          tags?: string | null
          titulo_original?: string | null
          url?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      acervo_stats: { Args: never; Returns: Json }
      admin_akasha_conversas: {
        Args: { p_busca?: string; p_limit?: number; p_offset?: number }
        Returns: {
          email: string
          nome: string
          total_geral: number
          total_msgs: number
          ultima_data: string
          ultima_pergunta: string
          ultima_resposta: string
        }[]
      }
      admin_akasha_historico: {
        Args: { p_email: string }
        Returns: {
          conteudo: string
          data_hora: string
          msg_id: number
          tipo: string
        }[]
      }
      admin_dashboard_resumo: { Args: never; Returns: Json }
      admin_set_portal_conteudo_destaques: {
        Args: { _ids: string[] }
        Returns: {
          destaque_ordem: number
          id: string
        }[]
      }
      akasha_distribuicao_horas: {
        Args: never
        Returns: {
          hora: number
          msgs: number
          percentual: number
        }[]
      }
      akasha_evolucao_diaria: {
        Args: never
        Returns: {
          dia: string
          msgs: number
          usuarios: number
        }[]
      }
      akasha_gate: { Args: { p_email: string }; Returns: Json }
      akasha_reset_mensal: { Args: never; Returns: number }
      arpg_record_rename: {
        Args: { p_nick: string; p_player: string }
        Returns: Json
      }
      arpg_record_submit: {
        Args: {
          p_buffs: Json
          p_cls: string
          p_lv: number
          p_map: number
          p_nick: string
          p_player: string
          p_seed: number
          p_ticks: number
        }
        Returns: Json
      }
      arpg_record_top: {
        Args: { p_map: number; p_player?: string }
        Returns: Json
      }
      artigo_do_dia: {
        Args: never
        Returns: {
          created_at: string
          destaque_index: boolean | null
          destaque_ordem: number | null
          id: string
          image_url: string | null
          link_do_artigo: string | null
          meta_description: string | null
          status: string | null
          summary: string | null
          tags: string | null
          timestamps: Json | null
          title: string
          video_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "portal_conteudo"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      atualizar_estatisticas_globais: { Args: never; Returns: undefined }
      atualizar_meus_dados: {
        Args: {
          p_cpf?: string
          p_endereco?: Json
          p_nome_completo?: string
          p_telefone?: string
        }
        Returns: Json
      }
      busca_global: {
        Args: { p_limite_por_tipo?: number; p_termo: string }
        Returns: {
          id: string
          imagem: string
          pontuacao: number
          rota: string
          subtitulo: string
          tipo: string
          titulo: string
        }[]
      }
      buscar_ajuda: {
        Args: { p_termo?: string }
        Returns: {
          assunto: string
          categoria: string
          link: string
          resposta_curta: string
        }[]
      }
      buscar_minha_rotina: {
        Args: { p_chave: string; p_dia: number; p_email: string }
        Returns: {
          dia: number
          resumo: string
          slot: string
          titulo: string
        }[]
      }
      buscar_produto: {
        Args: { p_dosha?: string; p_termo?: string }
        Returns: {
          imagem_url: string
          link: string
          nome: string
          preco: number
          resumo: string
          tags: string
        }[]
      }
      buscar_receita: {
        Args: { p_dosha?: string; p_termo?: string }
        Returns: {
          dicas: string
          dosha_fit: string
          imagem_url: string
          ingredientes: Json
          link: string
          modo_preparo: Json
          resumo: string
          titulo: string
        }[]
      }
      bytea_to_text: { Args: { data: string }; Returns: string }
      calc_dosha_status: {
        Args: { dosha: string; score: number }
        Returns: string
      }
      claim_dosha_test: { Args: { p_id_publico?: string }; Returns: Json }
      escola_aluno_atual: { Args: never; Returns: string }
      escola_cardapio_do_modulo: {
        Args: { p_slug: string }
        Returns: {
          dia: string
          nota: string
          nuggets: Json
          ordem: number
          refeicao: string
        }[]
      }
      escola_vincular_minha_conta: { Args: never; Returns: undefined }
      evolucao_chave: {
        Args: { p_cadencia: string; p_dia: string; p_ref: string }
        Returns: string
      }
      evolucao_recomputar: { Args: { p_user: string }; Returns: undefined }
      evolucao_registrar: {
        Args: { p_ref?: string; p_tipo: string }
        Returns: Json
      }
      evolucao_sincronizar: { Args: { p_user?: string }; Returns: number }
      find_akasha_by_slug: {
        Args: { _slug: string }
        Returns: {
          data_postagem: string
          id: number
          tags: string
          texto_inicio: string
          titulo: string
        }[]
      }
      find_video_by_slug: {
        Args: { _slug: string }
        Returns: {
          criado_em: string
          mini_resumo: string
          nova_descricao: string
          novo_titulo: string
          tags: string
          texto_para_embedding: string
          video_id: string
        }[]
      }
      find_video_canonico: {
        Args: { _slug: string }
        Returns: {
          criado_em: string
          is_live: boolean
          is_oficial: boolean
          is_receita: boolean
          mini_resumo: string
          nova_descricao: string
          novo_titulo: string
          slug: string
          tags: string
          url: string
          video_id: string
        }[]
      }
      gerar_insights_ayurvedicos: {
        Args: { p_registro_id: string }
        Returns: Json
      }
      gerar_rotina_para: { Args: { p_idpublico: string }; Returns: number }
      get_dosha_principal: {
        Args: { k: number; p: number; v: number }
        Returns: string
      }
      get_meu_perfil_home: { Args: never; Returns: Json }
      get_meu_perfil_stats: { Args: never; Returns: Json }
      get_minha_evolucao: { Args: never; Returns: Json }
      get_minha_jornada: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hoje_no_portal: { Args: never; Returns: Json }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      jogo_nivel_de: {
        Args: { p_email: string }
        Returns: {
          nivel_nome: string
          nivel_ordem: number
          xp_total: number
        }[]
      }
      match_conteudo: {
        Args: {
          p_dosha?: string
          p_limite_por_tipo?: number
          p_tags?: string[]
        }
        Returns: {
          id: string
          imagem: string
          pontos: number
          rota: string
          tags: string[]
          tipo: string
          titulo: string
        }[]
      }
      match_documents: {
        Args: {
          filter?: Json
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_jornadaaliment: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_testededosha: {
        Args: {
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          explicacao: string
          id: string
          opcoes_pontuadas: Json
          pergunta_texto: string
          similarity: number
          tag: string
        }[]
      }
      owns_rotina: { Args: { p_test_id: string }; Returns: boolean }
      preparar_login_contexto: {
        Args: { p_contexto: string; p_email: string }
        Returns: undefined
      }
      receita_do_dia: {
        Args: never
        Returns: {
          criado_em: string | null
          embedding: string | null
          legenda: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          status: string | null
          tags: string | null
          texto_para_embedding: string | null
          titulo_original: string | null
          url: string | null
          video_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "portal_receitas"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      receita_teaser: { Args: { p_item: string }; Returns: Json }
      recompute_user_level: { Args: { p_user: string }; Returns: undefined }
      restore_dosha_test_version: {
        Args: { _version_number: number }
        Returns: undefined
      }
      rpg_admin_select: { Args: { _table: string }; Returns: Json }
      rpg_play: { Args: { _args?: Json; _fn: string }; Returns: Json }
      rpg_rpc: { Args: { _args?: Json; _fn: string }; Returns: Json }
      sou_aluno_escola: { Args: never; Returns: boolean }
      tag_normalizar: { Args: { p: string }; Returns: string }
      tem_acesso_curso: { Args: { p_curso_id: string }; Returns: boolean }
      termos_aplicar: { Args: { p_html: string }; Returns: string }
      text_to_bytea: { Args: { data: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      devlog_status:
        | "planejado"
        | "em_andamento"
        | "concluido"
        | "bloqueado"
        | "em_revisao"
      devlog_tipo: "vertical" | "modulo" | "submodulo" | "infra" | "manifesto"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
      app_role: ["admin", "moderator", "user"],
      devlog_status: [
        "planejado",
        "em_andamento",
        "concluido",
        "bloqueado",
        "em_revisao",
      ],
      devlog_tipo: ["vertical", "modulo", "submodulo", "infra", "manifesto"],
    },
  },
} as const
