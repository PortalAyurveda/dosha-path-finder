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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_tarefas: {
        Row: {
          anexos: Json
          arquivada: boolean
          atualizado_em: string
          concluida_em: string | null
          criado_em: string
          criado_por: string | null
          devlog_id: string | null
          funcoes: string[]
          id: string
          iniciada_em: string | null
          notas: Json
          objetivo: string | null
          ordem: number
          status: string
          status_em: string
          titulo: string
          urgente: boolean
        }
        Insert: {
          anexos?: Json
          arquivada?: boolean
          atualizado_em?: string
          concluida_em?: string | null
          criado_em?: string
          criado_por?: string | null
          devlog_id?: string | null
          funcoes?: string[]
          id?: string
          iniciada_em?: string | null
          notas?: Json
          objetivo?: string | null
          ordem: number
          status?: string
          status_em?: string
          titulo: string
          urgente?: boolean
        }
        Update: {
          anexos?: Json
          arquivada?: boolean
          atualizado_em?: string
          concluida_em?: string | null
          criado_em?: string
          criado_por?: string | null
          devlog_id?: string | null
          funcoes?: string[]
          id?: string
          iniciada_em?: string | null
          notas?: Json
          objetivo?: string | null
          ordem?: number
          status?: string
          status_em?: string
          titulo?: string
          urgente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "admin_tarefas_devlog_id_fkey"
            columns: ["devlog_id"]
            isOneToOne: false
            referencedRelation: "portal_devlog"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_comunicacoes: {
        Row: {
          assunto: string
          ativo: boolean
          corpo_html: string | null
          created_at: string
          cta_texto: string | null
          cta_url: string | null
          h1: string
          h1sub: string
          id: string
          label: string
          nome: string
          publico_dosha: string | null
          publico_premium: string | null
          regras: Json
          tipo: string
          updated_at: string
        }
        Insert: {
          assunto: string
          ativo?: boolean
          corpo_html?: string | null
          created_at?: string
          cta_texto?: string | null
          cta_url?: string | null
          h1: string
          h1sub: string
          id: string
          label: string
          nome: string
          publico_dosha?: string | null
          publico_premium?: string | null
          regras?: Json
          tipo: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          ativo?: boolean
          corpo_html?: string | null
          created_at?: string
          cta_texto?: string | null
          cta_url?: string | null
          h1?: string
          h1sub?: string
          id?: string
          label?: string
          nome?: string
          publico_dosha?: string | null
          publico_premium?: string | null
          regras?: Json
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      agenda_comunicacoes_secoes: {
        Row: {
          artigo_id: string | null
          ativo: boolean
          atualizado_em: string
          banner_id: string | null
          biblioteca_pagina: string | null
          comunicacao_id: string
          criado_em: string
          cta_texto: string | null
          cta_url: string | null
          id: string
          ordem: number
          produto_id: number | null
          receita_id: string | null
          texto: string | null
          tipo: string
          titulo: string | null
          video_id: string | null
        }
        Insert: {
          artigo_id?: string | null
          ativo?: boolean
          atualizado_em?: string
          banner_id?: string | null
          biblioteca_pagina?: string | null
          comunicacao_id: string
          criado_em?: string
          cta_texto?: string | null
          cta_url?: string | null
          id?: string
          ordem: number
          produto_id?: number | null
          receita_id?: string | null
          texto?: string | null
          tipo: string
          titulo?: string | null
          video_id?: string | null
        }
        Update: {
          artigo_id?: string | null
          ativo?: boolean
          atualizado_em?: string
          banner_id?: string | null
          biblioteca_pagina?: string | null
          comunicacao_id?: string
          criado_em?: string
          cta_texto?: string | null
          cta_url?: string | null
          id?: string
          ordem?: number
          produto_id?: number | null
          receita_id?: string | null
          texto?: string | null
          tipo?: string
          titulo?: string | null
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_comunicacoes_secoes_artigo_id_fkey"
            columns: ["artigo_id"]
            isOneToOne: false
            referencedRelation: "portal_conteudo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_comunicacoes_secoes_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banner_placar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_comunicacoes_secoes_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_comunicacoes_secoes_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "agenda_comunicacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_comunicacoes_secoes_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "portal_receitas"
            referencedColumns: ["video_id"]
          },
          {
            foreignKeyName: "agenda_comunicacoes_secoes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos_seo"
            referencedColumns: ["video_id"]
          },
        ]
      }
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
      alunos_plataformas_externas: {
        Row: {
          created_at: string
          curso_id: string | null
          curso_nome_externo: string
          data_compra: string | null
          data_vencimento_acesso: string | null
          email: string
          id: string
          nome: string
          origem_id: string | null
          plataforma: string
          progresso: number | null
          status_acesso: string | null
          telefone: string | null
          turma: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id?: string | null
          curso_nome_externo: string
          data_compra?: string | null
          data_vencimento_acesso?: string | null
          email: string
          id?: string
          nome: string
          origem_id?: string | null
          plataforma: string
          progresso?: number | null
          status_acesso?: string | null
          telefone?: string | null
          turma?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string | null
          curso_nome_externo?: string
          data_compra?: string | null
          data_vencimento_acesso?: string | null
          email?: string
          id?: string
          nome?: string
          origem_id?: string | null
          plataforma?: string
          progresso?: number | null
          status_acesso?: string | null
          telefone?: string | null
          turma?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alunos_plataformas_externas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      antiruido_trocas: {
        Row: {
          ativo: boolean
          id: number
          nota: string | null
          ocorrencias: number | null
          padrao: string
          troca: string
        }
        Insert: {
          ativo?: boolean
          id?: never
          nota?: string | null
          ocorrencias?: number | null
          padrao: string
          troca: string
        }
        Update: {
          ativo?: boolean
          id?: never
          nota?: string | null
          ocorrencias?: number | null
          padrao?: string
          troca?: string
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
      ashtanga_hridaya_pilot_gpt54: {
        Row: {
          commentary_pt: string | null
          created_at: string | null
          id: number
          pdf_page: number | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          commentary_pt?: string | null
          created_at?: string | null
          id?: number
          pdf_page?: number | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          commentary_pt?: string | null
          created_at?: string | null
          id?: number
          pdf_page?: number | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      ashtanga_hridaya_pt_pages: {
        Row: {
          created_at: string | null
          id: number
          pdf_page: number
          raw_transcription: string
          volume: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          pdf_page: number
          raw_transcription: string
          volume: number
        }
        Update: {
          created_at?: string | null
          id?: never
          pdf_page?: number
          raw_transcription?: string
          volume?: number
        }
        Relationships: []
      }
      ashtanga_hridaya_verses: {
        Row: {
          book: string
          chapter_name: string | null
          chapter_no: string | null
          commentary_pt: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          sthana: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          commentary_pt?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          sthana?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          commentary_pt?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          sthana?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      ashtanga_sangraha_verses: {
        Row: {
          book: string
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          indu_commentary: string | null
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          sthana: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          indu_commentary?: string | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          sthana?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          indu_commentary?: string | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          sthana?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      assinatura_cobrancas: {
        Row: {
          billing_reason: string | null
          cobrado_em: string
          created_at: string
          email: string | null
          id: string
          nome: string | null
          plano: string
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          tipo: string
          user_id: string | null
          valor: number
        }
        Insert: {
          billing_reason?: string | null
          cobrado_em?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          plano: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          tipo?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          billing_reason?: string | null
          cobrado_em?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          plano?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          tipo?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          acesso_ate: string | null
          canceled_at: string | null
          ciclo_dias: number | null
          created_at: string
          email: string
          email_falha_enviado_em: string | null
          gateway: string
          id: string
          lembrete_enviado_em: string | null
          mp_payment_id: string | null
          nome: string | null
          pix_expira_em: string | null
          pix_qr_code: string | null
          pix_qr_image_url: string | null
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
          acesso_ate?: string | null
          canceled_at?: string | null
          ciclo_dias?: number | null
          created_at?: string
          email: string
          email_falha_enviado_em?: string | null
          gateway?: string
          id?: string
          lembrete_enviado_em?: string | null
          mp_payment_id?: string | null
          nome?: string | null
          pix_expira_em?: string | null
          pix_qr_code?: string | null
          pix_qr_image_url?: string | null
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
          acesso_ate?: string | null
          canceled_at?: string | null
          ciclo_dias?: number | null
          created_at?: string
          email?: string
          email_falha_enviado_em?: string | null
          gateway?: string
          id?: string
          lembrete_enviado_em?: string | null
          mp_payment_id?: string | null
          nome?: string | null
          pix_expira_em?: string | null
          pix_qr_code?: string | null
          pix_qr_image_url?: string | null
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
      auditoria_envios_log: {
        Row: {
          comunicacao_id: string
          conteudo_chave: Json | null
          criado_em: string
          data_auditoria: string
          edicao: string | null
          email_amostra: string | null
          id: string
          problemas_achados: string | null
          qtd_enviados_24h: number | null
          veredito: string | null
        }
        Insert: {
          comunicacao_id: string
          conteudo_chave?: Json | null
          criado_em?: string
          data_auditoria?: string
          edicao?: string | null
          email_amostra?: string | null
          id?: string
          problemas_achados?: string | null
          qtd_enviados_24h?: number | null
          veredito?: string | null
        }
        Update: {
          comunicacao_id?: string
          conteudo_chave?: Json | null
          criado_em?: string
          data_auditoria?: string
          edicao?: string | null
          email_amostra?: string | null
          id?: string
          problemas_achados?: string | null
          qtd_enviados_24h?: number | null
          veredito?: string | null
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
      auditoria_rag_cursos: {
        Row: {
          busca_tecnica: string | null
          contexto_recuperado: string | null
          curso: string | null
          data_hora: string
          email_aluno: string | null
          id: number
          pergunta_original: string | null
          resposta_final: string | null
        }
        Insert: {
          busca_tecnica?: string | null
          contexto_recuperado?: string | null
          curso?: string | null
          data_hora?: string
          email_aluno?: string | null
          id?: never
          pergunta_original?: string | null
          resposta_final?: string | null
        }
        Update: {
          busca_tecnica?: string | null
          contexto_recuperado?: string | null
          curso?: string | null
          data_hora?: string
          email_aluno?: string | null
          id?: never
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
      backup_nomes_12_08_2026: {
        Row: {
          criado_em: string
          email: string | null
          nome_antigo: string | null
          nome_completo_antigo: string | null
          ref_id: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          email?: string | null
          nome_antigo?: string | null
          nome_completo_antigo?: string | null
          ref_id: string
          tipo: string
        }
        Update: {
          criado_em?: string
          email?: string | null
          nome_antigo?: string | null
          nome_completo_antigo?: string | null
          ref_id?: string
          tipo?: string
        }
        Relationships: []
      }
      banner_eventos: {
        Row: {
          banner_id: string | null
          criado_em: string
          dosha_tag: string | null
          evento: string
          id: number
          pagina: string | null
          slot: string
          user_id: string | null
        }
        Insert: {
          banner_id?: string | null
          criado_em?: string
          dosha_tag?: string | null
          evento: string
          id?: number
          pagina?: string | null
          slot: string
          user_id?: string | null
        }
        Update: {
          banner_id?: string | null
          criado_em?: string
          dosha_tag?: string | null
          evento?: string
          id?: number
          pagina?: string | null
          slot?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "banner_eventos_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banner_placar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banner_eventos_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
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
      banners_backup_070826: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          campanha: string | null
          criado_em: string | null
          html: string | null
          id: string | null
          ordem: number | null
          slot: string | null
          tags: string[] | null
          titulo_admin: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campanha?: string | null
          criado_em?: string | null
          html?: string | null
          id?: string | null
          ordem?: number | null
          slot?: string | null
          tags?: string[] | null
          titulo_admin?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          campanha?: string | null
          criado_em?: string | null
          html?: string | null
          id?: string | null
          ordem?: number | null
          slot?: string | null
          tags?: string[] | null
          titulo_admin?: string | null
        }
        Relationships: []
      }
      banners_molde: {
        Row: {
          atualizado_em: string
          contrato: string
          criado_em: string
          descricao: string
          exemplo_html: string | null
          ordem: number
          rotulo: string | null
          slot: string
        }
        Insert: {
          atualizado_em?: string
          contrato: string
          criado_em?: string
          descricao: string
          exemplo_html?: string | null
          ordem?: number
          rotulo?: string | null
          slot: string
        }
        Update: {
          atualizado_em?: string
          contrato?: string
          criado_em?: string
          descricao?: string
          exemplo_html?: string | null
          ordem?: number
          rotulo?: string | null
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
      bhavaprakasha_nighantu_verses: {
        Row: {
          book: string
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          entry_name: string | null
          footnote_synonyms: string | null
          has_lacuna: boolean | null
          id: number
          is_parishishta_appendix: boolean | null
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string
        }
        Insert: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          footnote_synonyms?: string | null
          has_lacuna?: boolean | null
          id?: never
          is_parishishta_appendix?: boolean | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no: number
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit: string
        }
        Update: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          footnote_synonyms?: string | null
          has_lacuna?: boolean | null
          id?: never
          is_parishishta_appendix?: boolean | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string
        }
        Relationships: []
      }
      bhavaprakasha_verses: {
        Row: {
          book: string
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          has_lacuna: boolean | null
          hindi_bhavartha: string | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          hindi_bhavartha?: string | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          hindi_bhavartha?: string | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
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
      charaka_verses: {
        Row: {
          book: string
          chakrapani_commentary: string | null
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote_skt: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chakrapani_commentary?: string | null
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chakrapani_commentary?: string | null
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
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
      chat_histories_lixo_backup_070826: {
        Row: {
          data_hora: string | null
          id: number | null
          message: Json | null
          session_id: string | null
        }
        Insert: {
          data_hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
        }
        Update: {
          data_hora?: string | null
          id?: number | null
          message?: Json | null
          session_id?: string | null
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
          gateway: string
          id: string
          moeda: string
          mp_payment_id: string | null
          nome_cliente: string | null
          paid_at: string | null
          pix_expira_em: string | null
          pix_qr_code: string | null
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
          gateway?: string
          id?: string
          moeda?: string
          mp_payment_id?: string | null
          nome_cliente?: string | null
          paid_at?: string | null
          pix_expira_em?: string | null
          pix_qr_code?: string | null
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
          gateway?: string
          id?: string
          moeda?: string
          mp_payment_id?: string | null
          nome_cliente?: string | null
          paid_at?: string | null
          pix_expira_em?: string | null
          pix_qr_code?: string | null
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
      comunicacao_config: {
        Row: {
          chave: string
          valor: string
        }
        Insert: {
          chave: string
          valor: string
        }
        Update: {
          chave?: string
          valor?: string
        }
        Relationships: []
      }
      comunicacao_envios_conteudo: {
        Row: {
          assunto: string | null
          comunicacao_id: string
          criado_em: string
          edicao: string
          email: string
          html: string | null
          id: number
        }
        Insert: {
          assunto?: string | null
          comunicacao_id: string
          criado_em?: string
          edicao?: string
          email: string
          html?: string | null
          id?: never
        }
        Update: {
          assunto?: string | null
          comunicacao_id?: string
          criado_em?: string
          edicao?: string
          email?: string
          html?: string | null
          id?: never
        }
        Relationships: [
          {
            foreignKeyName: "comunicacao_envios_conteudo_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "agenda_comunicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacao_log: {
        Row: {
          comunicacao_id: string
          detalhe: string | null
          edicao: string
          email: string
          enviado_em: string
          id: number
          status: string
        }
        Insert: {
          comunicacao_id: string
          detalhe?: string | null
          edicao?: string
          email: string
          enviado_em?: string
          id?: number
          status?: string
        }
        Update: {
          comunicacao_id?: string
          detalhe?: string | null
          edicao?: string
          email?: string
          enviado_em?: string
          id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacao_log_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "agenda_comunicacoes"
            referencedColumns: ["id"]
          },
        ]
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
      corte_teste: {
        Row: {
          chars: number | null
          conteudo: string | null
          criado_em: string | null
          id: number
          indice: number | null
          metodo: string | null
          video_id: string | null
        }
        Insert: {
          chars?: number | null
          conteudo?: string | null
          criado_em?: string | null
          id?: never
          indice?: number | null
          metodo?: string | null
          video_id?: string | null
        }
        Update: {
          chars?: number | null
          conteudo?: string | null
          criado_em?: string | null
          id?: never
          indice?: number | null
          metodo?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      crm_dominios: {
        Row: {
          aceita_email: boolean
          checado_em: string
          dominio: string
          tem_mx: boolean
        }
        Insert: {
          aceita_email: boolean
          checado_em?: string
          dominio: string
          tem_mx: boolean
        }
        Update: {
          aceita_email?: boolean
          checado_em?: string
          dominio?: string
          tem_mx?: boolean
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
      curso_aulas_fila: {
        Row: {
          atualizado_em: string
          aula_ordem: number | null
          aula_titulo: string
          chars_limpos: number | null
          chunks_gerados: number
          cursos: string[]
          legenda_bruta: string | null
          modulo_ordem: number | null
          modulo_titulo: string | null
          origem: string
          status: string
          tema: string | null
          tentativas: number
          texto_limpo: string | null
          ultimo_erro: string | null
          video_id: string
          youtube_url: string | null
        }
        Insert: {
          atualizado_em?: string
          aula_ordem?: number | null
          aula_titulo: string
          chars_limpos?: number | null
          chunks_gerados?: number
          cursos: string[]
          legenda_bruta?: string | null
          modulo_ordem?: number | null
          modulo_titulo?: string | null
          origem?: string
          status?: string
          tema?: string | null
          tentativas?: number
          texto_limpo?: string | null
          ultimo_erro?: string | null
          video_id: string
          youtube_url?: string | null
        }
        Update: {
          atualizado_em?: string
          aula_ordem?: number | null
          aula_titulo?: string
          chars_limpos?: number | null
          chunks_gerados?: number
          cursos?: string[]
          legenda_bruta?: string | null
          modulo_ordem?: number | null
          modulo_titulo?: string | null
          origem?: string
          status?: string
          tema?: string | null
          tentativas?: number
          texto_limpo?: string | null
          ultimo_erro?: string | null
          video_id?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      curso_diplomas: {
        Row: {
          carga_horaria: string
          cor_acento: string
          cor_clara: string
          cor_escura: string
          cor_primaria: string
          created_at: string
          curso_id: string
          id: string
          logo_url: string | null
          n_aulas: number | null
          n_modulos: number | null
          nome_exibicao: string
          texto_certificado: string
          updated_at: string
        }
        Insert: {
          carga_horaria?: string
          cor_acento?: string
          cor_clara?: string
          cor_escura?: string
          cor_primaria?: string
          created_at?: string
          curso_id: string
          id?: string
          logo_url?: string | null
          n_aulas?: number | null
          n_modulos?: number | null
          nome_exibicao?: string
          texto_certificado?: string
          updated_at?: string
        }
        Update: {
          carga_horaria?: string
          cor_acento?: string
          cor_clara?: string
          cor_escura?: string
          cor_primaria?: string
          created_at?: string
          curso_id?: string
          id?: string
          logo_url?: string | null
          n_aulas?: number | null
          n_modulos?: number | null
          nome_exibicao?: string
          texto_certificado?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_diplomas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: true
            referencedRelation: "cursos"
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
          expira_em: string | null
          id: string
          mp_payment_id: string | null
          origem: string
          status: string
          stripe_session_id: string | null
          user_id: string
          valor_pago: number | null
        }
        Insert: {
          criado_em?: string
          curso_id: string
          expira_em?: string | null
          id?: string
          mp_payment_id?: string | null
          origem?: string
          status?: string
          stripe_session_id?: string | null
          user_id: string
          valor_pago?: number | null
        }
        Update: {
          criado_em?: string
          curso_id?: string
          expira_em?: string | null
          id?: string
          mp_payment_id?: string | null
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
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          descricao?: string | null
          id?: string
          ordem?: number
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          descricao?: string | null
          id?: string
          ordem?: number
          tipo?: string
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
          card_bullet_1: string | null
          card_bullet_2: string | null
          card_bullet_3: string | null
          card_bullet_4: string | null
          card_bullet_5: string | null
          card_cor_primaria: string | null
          card_cor_secundaria: string | null
          card_cta_texto: string | null
          card_estado: string
          card_estado_frase: string | null
          card_fosco_opacidade: number
          card_foto_posicao: string | null
          card_foto_zoom: number
          card_lancamento_data: string | null
          card_logo_tamanho: number
          card_logo_url: string | null
          card_mostrar_cadeado: boolean
          card_mostrar_logo: boolean
          card_mostrar_subtitulo: boolean
          card_mostrar_titulo: boolean
          card_overlay_pos: string
          card_subtitulo: string | null
          card_texto_cor: string
          card_titulo_sobre_foto: boolean
          card_titulo_tamanho: number
          created_at: string
          data_lancamento: string | null
          descricao: string | null
          descricao_em_breve: string | null
          id: string
          ordem: number
          pagina_lancamento_url: string | null
          preco: number | null
          preco_pix: number | null
          slug: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          capa_url?: string | null
          card_bullet_1?: string | null
          card_bullet_2?: string | null
          card_bullet_3?: string | null
          card_bullet_4?: string | null
          card_bullet_5?: string | null
          card_cor_primaria?: string | null
          card_cor_secundaria?: string | null
          card_cta_texto?: string | null
          card_estado?: string
          card_estado_frase?: string | null
          card_fosco_opacidade?: number
          card_foto_posicao?: string | null
          card_foto_zoom?: number
          card_lancamento_data?: string | null
          card_logo_tamanho?: number
          card_logo_url?: string | null
          card_mostrar_cadeado?: boolean
          card_mostrar_logo?: boolean
          card_mostrar_subtitulo?: boolean
          card_mostrar_titulo?: boolean
          card_overlay_pos?: string
          card_subtitulo?: string | null
          card_texto_cor?: string
          card_titulo_sobre_foto?: boolean
          card_titulo_tamanho?: number
          created_at?: string
          data_lancamento?: string | null
          descricao?: string | null
          descricao_em_breve?: string | null
          id?: string
          ordem?: number
          pagina_lancamento_url?: string | null
          preco?: number | null
          preco_pix?: number | null
          slug: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          capa_url?: string | null
          card_bullet_1?: string | null
          card_bullet_2?: string | null
          card_bullet_3?: string | null
          card_bullet_4?: string | null
          card_bullet_5?: string | null
          card_cor_primaria?: string | null
          card_cor_secundaria?: string | null
          card_cta_texto?: string | null
          card_estado?: string
          card_estado_frase?: string | null
          card_fosco_opacidade?: number
          card_foto_posicao?: string | null
          card_foto_zoom?: number
          card_lancamento_data?: string | null
          card_logo_tamanho?: number
          card_logo_url?: string | null
          card_mostrar_cadeado?: boolean
          card_mostrar_logo?: boolean
          card_mostrar_subtitulo?: boolean
          card_mostrar_titulo?: boolean
          card_overlay_pos?: string
          card_subtitulo?: string | null
          card_texto_cor?: string
          card_titulo_sobre_foto?: boolean
          card_titulo_tamanho?: number
          created_at?: string
          data_lancamento?: string | null
          descricao?: string | null
          descricao_em_breve?: string | null
          id?: string
          ordem?: number
          pagina_lancamento_url?: string | null
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
      dhanvantari_nighantu_verses: {
        Row: {
          book: string
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          entry_name: string | null
          has_lacuna: boolean | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number
          source_file: string | null
          source_text: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string
        }
        Insert: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no: number
          source_file?: string | null
          source_text?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit: string
        }
        Update: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number
          source_file?: string | null
          source_text?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string
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
      documents_cursos: {
        Row: {
          chunk_config: string | null
          content: string
          criado_em: string
          cursos: string[]
          embedding: string | null
          id: number
          minuto: number | null
          modelo: string | null
          modulo_titulo: string | null
          pedaco: number | null
          prompt_versao: string | null
          slug_portal: string | null
          tema: string | null
          titulo_no_curso: string | null
          titulo_no_youtube: string | null
          titulo_seo: string | null
          total_pedacos: number | null
          trecho_origem: string | null
          url_youtube: string | null
          video_id: string
        }
        Insert: {
          chunk_config?: string | null
          content: string
          criado_em?: string
          cursos: string[]
          embedding?: string | null
          id?: never
          minuto?: number | null
          modelo?: string | null
          modulo_titulo?: string | null
          pedaco?: number | null
          prompt_versao?: string | null
          slug_portal?: string | null
          tema?: string | null
          titulo_no_curso?: string | null
          titulo_no_youtube?: string | null
          titulo_seo?: string | null
          total_pedacos?: number | null
          trecho_origem?: string | null
          url_youtube?: string | null
          video_id: string
        }
        Update: {
          chunk_config?: string | null
          content?: string
          criado_em?: string
          cursos?: string[]
          embedding?: string | null
          id?: never
          minuto?: number | null
          modelo?: string | null
          modulo_titulo?: string | null
          pedaco?: number | null
          prompt_versao?: string | null
          slug_portal?: string | null
          tema?: string | null
          titulo_no_curso?: string | null
          titulo_no_youtube?: string | null
          titulo_seo?: string | null
          total_pedacos?: number | null
          trecho_origem?: string | null
          url_youtube?: string | null
          video_id?: string
        }
        Relationships: []
      }
      documents_cursos_puro: {
        Row: {
          aula_titulo: string | null
          chars: number | null
          content: string
          criado_em: string
          cursos: string[]
          embedding: string | null
          id: number
          indice: number | null
          minuto: number | null
          modulo_titulo: string | null
          tema: string | null
          total: number | null
          video_id: string
        }
        Insert: {
          aula_titulo?: string | null
          chars?: number | null
          content: string
          criado_em?: string
          cursos: string[]
          embedding?: string | null
          id?: never
          indice?: number | null
          minuto?: number | null
          modulo_titulo?: string | null
          tema?: string | null
          total?: number | null
          video_id: string
        }
        Update: {
          aula_titulo?: string | null
          chars?: number | null
          content?: string
          criado_em?: string
          cursos?: string[]
          embedding?: string | null
          id?: never
          indice?: number | null
          minuto?: number | null
          modulo_titulo?: string | null
          tema?: string | null
          total?: number | null
          video_id?: string
        }
        Relationships: []
      }
      documents_cursos_v1: {
        Row: {
          aula_titulo: string | null
          content: string | null
          criado_em: string | null
          cursos: string[] | null
          embedding: string | null
          id: number | null
          metadata: Json | null
          minuto: number | null
          modelo: string | null
          modulo_titulo: string | null
          nivel: string | null
          tema: string | null
          tipo: string | null
          versao: string | null
          video_id: string | null
        }
        Insert: {
          aula_titulo?: string | null
          content?: string | null
          criado_em?: string | null
          cursos?: string[] | null
          embedding?: string | null
          id?: number | null
          metadata?: Json | null
          minuto?: number | null
          modelo?: string | null
          modulo_titulo?: string | null
          nivel?: string | null
          tema?: string | null
          tipo?: string | null
          versao?: string | null
          video_id?: string | null
        }
        Update: {
          aula_titulo?: string | null
          content?: string | null
          criado_em?: string | null
          cursos?: string[] | null
          embedding?: string | null
          id?: number | null
          metadata?: Json | null
          minuto?: number | null
          modelo?: string | null
          modulo_titulo?: string | null
          nivel?: string | null
          tema?: string | null
          tipo?: string | null
          versao?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      documents_jiva: {
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
      email_eventos: {
        Row: {
          assunto: string | null
          comunicacao_id: string | null
          criado_em: string
          edicao: string | null
          email: string
          evento: string
          evento_bruto: string | null
          id: number
          message_id: string | null
          ocorreu_em: string
          payload: Json | null
          provedor: string
          url: string | null
        }
        Insert: {
          assunto?: string | null
          comunicacao_id?: string | null
          criado_em?: string
          edicao?: string | null
          email: string
          evento: string
          evento_bruto?: string | null
          id?: number
          message_id?: string | null
          ocorreu_em?: string
          payload?: Json | null
          provedor?: string
          url?: string | null
        }
        Update: {
          assunto?: string | null
          comunicacao_id?: string | null
          criado_em?: string
          edicao?: string | null
          email?: string
          evento?: string
          evento_bruto?: string | null
          id?: number
          message_id?: string | null
          ocorreu_em?: string
          payload?: Json | null
          provedor?: string
          url?: string | null
        }
        Relationships: []
      }
      email_supressao: {
        Row: {
          created_at: string
          email: string
          motivo: string
          origem: string | null
        }
        Insert: {
          created_at?: string
          email: string
          motivo?: string
          origem?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          motivo?: string
          origem?: string | null
        }
        Relationships: []
      }
      envios_avulsos: {
        Row: {
          assunto: string
          corpo_html: string
          criado_em: string
          criado_por: string | null
          cta_texto: string | null
          cta_url: string | null
          destinatarios: Json
          enviado_em: string | null
          h1: string
          h1sub: string | null
          id: string
          label: string
          status: string
          total_destinatarios: number
          total_enviados: number
        }
        Insert: {
          assunto: string
          corpo_html: string
          criado_em?: string
          criado_por?: string | null
          cta_texto?: string | null
          cta_url?: string | null
          destinatarios?: Json
          enviado_em?: string | null
          h1: string
          h1sub?: string | null
          id?: string
          label?: string
          status?: string
          total_destinatarios?: number
          total_enviados?: number
        }
        Update: {
          assunto?: string
          corpo_html?: string
          criado_em?: string
          criado_por?: string | null
          cta_texto?: string | null
          cta_url?: string | null
          destinatarios?: Json
          enviado_em?: string | null
          h1?: string
          h1sub?: string | null
          id?: string
          label?: string
          status?: string
          total_destinatarios?: number
          total_enviados?: number
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
      escola_avaliacao_alternativas: {
        Row: {
          correta: boolean
          created_at: string | null
          explicacao: string | null
          id: string
          ordem: number | null
          pergunta_id: string
          texto: string
        }
        Insert: {
          correta?: boolean
          created_at?: string | null
          explicacao?: string | null
          id?: string
          ordem?: number | null
          pergunta_id: string
          texto: string
        }
        Update: {
          correta?: boolean
          created_at?: string | null
          explicacao?: string | null
          id?: string
          ordem?: number | null
          pergunta_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_avaliacao_alternativas_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "escola_avaliacao_perguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      escola_avaliacao_perguntas: {
        Row: {
          created_at: string | null
          explicacao_geral: string | null
          id: string
          modulo_id: string
          ordem: number | null
          pergunta: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          explicacao_geral?: string | null
          id?: string
          modulo_id: string
          ordem?: number | null
          pergunta: string
          tipo?: string
        }
        Update: {
          created_at?: string | null
          explicacao_geral?: string | null
          id?: string
          modulo_id?: string
          ordem?: number | null
          pergunta?: string
          tipo?: string
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
          alternativa_id: string | null
          aluno_id: string
          created_at: string | null
          id: string
          pergunta_id: string
          resposta: string | null
          updated_at: string | null
        }
        Insert: {
          alternativa_id?: string | null
          aluno_id: string
          created_at?: string | null
          id?: string
          pergunta_id: string
          resposta?: string | null
          updated_at?: string | null
        }
        Update: {
          alternativa_id?: string | null
          aluno_id?: string
          created_at?: string | null
          id?: string
          pergunta_id?: string
          resposta?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escola_avaliacao_respostas_alternativa_id_fkey"
            columns: ["alternativa_id"]
            isOneToOne: false
            referencedRelation: "escola_avaliacao_alternativas"
            referencedColumns: ["id"]
          },
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
          aluno_nome?: string
          created_at?: string
          id?: string
          modulo_id: string
          storage_path: string
          tamanho_bytes?: number | null
          titulo: string
          user_id?: string
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
      ingredientes_catalogo: {
        Row: {
          created_at: string
          despensa: boolean
          familia_troca: string | null
          forma: string | null
          g_por_unidade_uso: number | null
          id: string
          nome: string
          nome_exibicao: string
          nome_exibicao_plural: string | null
          observacao: string | null
          perecivel_dias: number | null
          rende_por_embalagem: number | null
          revisado_humano: boolean
          rotulo_compra: string | null
          rotulo_compra_plural: string | null
          setor: string
          sinonimos: string[]
          unidade_compra: string | null
          unidade_de_uso: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          despensa?: boolean
          familia_troca?: string | null
          forma?: string | null
          g_por_unidade_uso?: number | null
          id?: string
          nome: string
          nome_exibicao: string
          nome_exibicao_plural?: string | null
          observacao?: string | null
          perecivel_dias?: number | null
          rende_por_embalagem?: number | null
          revisado_humano?: boolean
          rotulo_compra?: string | null
          rotulo_compra_plural?: string | null
          setor: string
          sinonimos?: string[]
          unidade_compra?: string | null
          unidade_de_uso?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          despensa?: boolean
          familia_troca?: string | null
          forma?: string | null
          g_por_unidade_uso?: number | null
          id?: string
          nome?: string
          nome_exibicao?: string
          nome_exibicao_plural?: string | null
          observacao?: string | null
          perecivel_dias?: number | null
          rende_por_embalagem?: number | null
          revisado_humano?: boolean
          rotulo_compra?: string | null
          rotulo_compra_plural?: string | null
          setor?: string
          sinonimos?: string[]
          unidade_compra?: string | null
          unidade_de_uso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingredientes_catalogo_unidade_de_uso_fkey"
            columns: ["unidade_de_uso"]
            isOneToOne: false
            referencedRelation: "unidades_medida"
            referencedColumns: ["unidade"]
          },
        ]
      }
      jiva_descartes: {
        Row: {
          chunk_idx: number | null
          criado_em: string | null
          id: number
          motivo: string | null
          trecho: string | null
          video_id: string | null
        }
        Insert: {
          chunk_idx?: number | null
          criado_em?: string | null
          id?: number
          motivo?: string | null
          trecho?: string | null
          video_id?: string | null
        }
        Update: {
          chunk_idx?: number | null
          criado_em?: string | null
          id?: number
          motivo?: string | null
          trecho?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      jiva_fila: {
        Row: {
          atualizado_em: string | null
          chunks_aprovados: number | null
          chunks_total: number | null
          fichas: number | null
          is_live: boolean | null
          origem: string
          status: string
          titulo: string | null
          video_id: string
        }
        Insert: {
          atualizado_em?: string | null
          chunks_aprovados?: number | null
          chunks_total?: number | null
          fichas?: number | null
          is_live?: boolean | null
          origem: string
          status?: string
          titulo?: string | null
          video_id: string
        }
        Update: {
          atualizado_em?: string | null
          chunks_aprovados?: number | null
          chunks_total?: number | null
          fichas?: number | null
          is_live?: boolean | null
          origem?: string
          status?: string
          titulo?: string | null
          video_id?: string
        }
        Relationships: []
      }
      jiva_gabarito_foto: {
        Row: {
          created_at: string
          id: string
          imagem_confianca: string | null
          imagem_local_path: string
          pasta_id: string
          tipo_foto: string
        }
        Insert: {
          created_at?: string
          id?: string
          imagem_confianca?: string | null
          imagem_local_path: string
          pasta_id: string
          tipo_foto: string
        }
        Update: {
          created_at?: string
          id?: string
          imagem_confianca?: string | null
          imagem_local_path?: string
          pasta_id?: string
          tipo_foto?: string
        }
        Relationships: [
          {
            foreignKeyName: "jiva_gabarito_foto_pasta_id_fkey"
            columns: ["pasta_id"]
            isOneToOne: false
            referencedRelation: "jiva_gabarito_pasta"
            referencedColumns: ["pasta_id"]
          },
        ]
      }
      jiva_gabarito_pasta: {
        Row: {
          created_at: string
          diagnostico_texto: string | null
          fonte: string
          id: string
          lingua_texto: string
          olhos_texto: string | null
          pasta_id: string
          rotulo_dosha: string | null
          status: string
          tratamento_texto: string | null
          unhas_texto: string | null
        }
        Insert: {
          created_at?: string
          diagnostico_texto?: string | null
          fonte?: string
          id?: string
          lingua_texto: string
          olhos_texto?: string | null
          pasta_id: string
          rotulo_dosha?: string | null
          status?: string
          tratamento_texto?: string | null
          unhas_texto?: string | null
        }
        Update: {
          created_at?: string
          diagnostico_texto?: string | null
          fonte?: string
          id?: string
          lingua_texto?: string
          olhos_texto?: string | null
          pasta_id?: string
          rotulo_dosha?: string | null
          status?: string
          tratamento_texto?: string | null
          unhas_texto?: string | null
        }
        Relationships: []
      }
      jiva_legendas_extra: {
        Row: {
          criado_em: string | null
          legenda: string
          origem: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string | null
          legenda: string
          origem?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string | null
          legenda?: string
          origem?: string | null
          video_id?: string
        }
        Relationships: []
      }
      jiva_receita_entrada: {
        Row: {
          created_at: string
          entrada: Json
          id: string
          pasta_id: string
        }
        Insert: {
          created_at?: string
          entrada: Json
          id?: string
          pasta_id: string
        }
        Update: {
          created_at?: string
          entrada?: Json
          id?: string
          pasta_id?: string
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
      kaiyadeva_nighantu_verses: {
        Row: {
          book: string
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          entry_name: string | null
          has_lacuna: boolean | null
          hindi_text: string | null
          id: number
          lacuna_note: string | null
          latin_name: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          has_lacuna?: boolean | null
          hindi_text?: string | null
          id?: never
          lacuna_note?: string | null
          latin_name?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          entry_name?: string | null
          has_lacuna?: boolean | null
          hindi_text?: string | null
          id?: never
          lacuna_note?: string | null
          latin_name?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      kashyapa_verses: {
        Row: {
          book: string | null
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote: string | null
          editorial_footnote_skt: string | null
          embedding: string | null
          has_lacuna: boolean | null
          hindi_translation: string | null
          hindi_vaktavya: string | null
          id: number
          lacuna_note: string | null
          ms_folio_ref: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string
        }
        Insert: {
          book?: string | null
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          hindi_translation?: string | null
          hindi_vaktavya?: string | null
          id?: never
          lacuna_note?: string | null
          ms_folio_ref?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit: string
        }
        Update: {
          book?: string | null
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          hindi_translation?: string | null
          hindi_vaktavya?: string | null
          id?: never
          lacuna_note?: string | null
          ms_folio_ref?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string
        }
        Relationships: []
      }
      kaviratna_raw_chunks: {
        Row: {
          chunk_index: number
          created_at: string | null
          end_line: number
          id: number
          processed: boolean
          raw_text: string
          start_line: number
        }
        Insert: {
          chunk_index: number
          created_at?: string | null
          end_line: number
          id?: never
          processed?: boolean
          raw_text: string
          start_line: number
        }
        Update: {
          chunk_index?: number
          created_at?: string | null
          end_line?: number
          id?: never
          processed?: boolean
          raw_text?: string
          start_line?: number
        }
        Relationships: []
      }
      kaviratna_sutrasthana_rows: {
        Row: {
          batch_end_line: number | null
          batch_start_line: number | null
          chunk_index: number
          created_at: string | null
          embedding: string | null
          footnote_marker: string | null
          footnote_text: string | null
          id: number
          para_num: string | null
          suspected_ocr_corruption: boolean
          translation_en: string
          translation_pt: string | null
        }
        Insert: {
          batch_end_line?: number | null
          batch_start_line?: number | null
          chunk_index: number
          created_at?: string | null
          embedding?: string | null
          footnote_marker?: string | null
          footnote_text?: string | null
          id?: never
          para_num?: string | null
          suspected_ocr_corruption?: boolean
          translation_en: string
          translation_pt?: string | null
        }
        Update: {
          batch_end_line?: number | null
          batch_start_line?: number | null
          chunk_index?: number
          created_at?: string | null
          embedding?: string | null
          footnote_marker?: string | null
          footnote_text?: string | null
          id?: never
          para_num?: string | null
          suspected_ocr_corruption?: boolean
          translation_en?: string
          translation_pt?: string | null
        }
        Relationships: []
      }
      kit_novato_curadoria: {
        Row: {
          artigo_imagem: string | null
          artigo_rota: string | null
          artigo_titulo: string | null
          atualizado_em: string | null
          dosha: string
          video_imagem: string | null
          video_rota: string | null
          video_titulo: string | null
        }
        Insert: {
          artigo_imagem?: string | null
          artigo_rota?: string | null
          artigo_titulo?: string | null
          atualizado_em?: string | null
          dosha: string
          video_imagem?: string | null
          video_rota?: string | null
          video_titulo?: string | null
        }
        Update: {
          artigo_imagem?: string | null
          artigo_rota?: string | null
          artigo_titulo?: string | null
          atualizado_em?: string | null
          dosha?: string
          video_imagem?: string | null
          video_rota?: string | null
          video_titulo?: string | null
        }
        Relationships: []
      }
      licoes_semana: {
        Row: {
          abertura: string
          atualizado_em: string | null
          dosha_alvo: string
          fecho: string
          licao: string
          ponte_artigo: string
          ponte_receitas: string
          ponte_video: string
          tema: string
        }
        Insert: {
          abertura: string
          atualizado_em?: string | null
          dosha_alvo: string
          fecho: string
          licao: string
          ponte_artigo: string
          ponte_receitas: string
          ponte_video: string
          tema: string
        }
        Update: {
          abertura?: string
          atualizado_em?: string | null
          dosha_alvo?: string
          fecho?: string
          licao?: string
          ponte_artigo?: string
          ponte_receitas?: string
          ponte_video?: string
          tema?: string
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
      madhava_nidana_verses: {
        Row: {
          atankadarpana_note: string | null
          book: string
          chapter_name: string | null
          citation_key: string
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote: string | null
          embedding: string | null
          id: number
          madhukosha_commentary: string | null
          notes: string | null
          page_line_ref: string | null
          pdf_page: number | null
          sequence_no: number
          source_file: string
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          atankadarpana_note?: string | null
          book?: string
          chapter_name?: string | null
          citation_key: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          id?: never
          madhukosha_commentary?: string | null
          notes?: string | null
          page_line_ref?: string | null
          pdf_page?: number | null
          sequence_no: number
          source_file: string
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          atankadarpana_note?: string | null
          book?: string
          chapter_name?: string | null
          citation_key?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          id?: never
          madhukosha_commentary?: string | null
          notes?: string | null
          page_line_ref?: string | null
          pdf_page?: number | null
          sequence_no?: number
          source_file?: string
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
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
      newsletter_dosha_estacao: {
        Row: {
          dosha_alvo: string
          estacao: string
          id: string
          mes_fim: number
          mes_inicio: number
          tag_correspondente: string
        }
        Insert: {
          dosha_alvo: string
          estacao: string
          id?: string
          mes_fim: number
          mes_inicio: number
          tag_correspondente: string
        }
        Update: {
          dosha_alvo?: string
          estacao?: string
          id?: string
          mes_fim?: number
          mes_inicio?: number
          tag_correspondente?: string
        }
        Relationships: []
      }
      newsletter_edicao_artigos: {
        Row: {
          edicao_id: string
          estagio_id: string
          id: string
          link_do_artigo: string
        }
        Insert: {
          edicao_id: string
          estagio_id: string
          id?: string
          link_do_artigo: string
        }
        Update: {
          edicao_id?: string
          estagio_id?: string
          id?: string
          link_do_artigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_edicao_artigos_edicao_id_fkey"
            columns: ["edicao_id"]
            isOneToOne: false
            referencedRelation: "newsletter_edicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_edicao_artigos_estagio_id_fkey"
            columns: ["estagio_id"]
            isOneToOne: false
            referencedRelation: "newsletter_estagios"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_edicoes: {
        Row: {
          akasha_titulo: string | null
          assunto: string | null
          destinatario_email: string | null
          dosha_foco: string | null
          enviado_em: string
          glossario_termo: string | null
          id: string
          numero_edicao: number | null
          produto_destaque_slug: string | null
          tipo: string
        }
        Insert: {
          akasha_titulo?: string | null
          assunto?: string | null
          destinatario_email?: string | null
          dosha_foco?: string | null
          enviado_em?: string
          glossario_termo?: string | null
          id?: string
          numero_edicao?: number | null
          produto_destaque_slug?: string | null
          tipo: string
        }
        Update: {
          akasha_titulo?: string | null
          assunto?: string | null
          destinatario_email?: string | null
          dosha_foco?: string | null
          enviado_em?: string
          glossario_termo?: string | null
          id?: string
          numero_edicao?: number | null
          produto_destaque_slug?: string | null
          tipo?: string
        }
        Relationships: []
      }
      newsletter_estagios: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          ordem: number
          tags_alvo: string[]
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          ordem: number
          tags_alvo: string[]
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number
          tags_alvo?: string[]
        }
        Relationships: []
      }
      newsletter_produto_destaque: {
        Row: {
          ativo: boolean
          ativo_desde: string
          created_at: string
          id: string
          motivo: string
          produto_slug: string
          publico_alvo: string
        }
        Insert: {
          ativo?: boolean
          ativo_desde?: string
          created_at?: string
          id?: string
          motivo: string
          produto_slug: string
          publico_alvo?: string
        }
        Update: {
          ativo?: boolean
          ativo_desde?: string
          created_at?: string
          id?: string
          motivo?: string
          produto_slug?: string
          publico_alvo?: string
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
      pesquisa_convites: {
        Row: {
          aberto_em: string | null
          canal: string
          criado_em: string
          dias_de_assinatura: number | null
          email: string
          enviado_em: string | null
          id: string
          nome: string | null
          pedido_id: string | null
          pesquisa_id: string
          plano: string | null
          respondido_em: string | null
          token: string
          user_id: string | null
        }
        Insert: {
          aberto_em?: string | null
          canal?: string
          criado_em?: string
          dias_de_assinatura?: number | null
          email: string
          enviado_em?: string | null
          id?: string
          nome?: string | null
          pedido_id?: string | null
          pesquisa_id: string
          plano?: string | null
          respondido_em?: string | null
          token?: string
          user_id?: string | null
        }
        Update: {
          aberto_em?: string | null
          canal?: string
          criado_em?: string
          dias_de_assinatura?: number | null
          email?: string
          enviado_em?: string | null
          id?: string
          nome?: string | null
          pedido_id?: string | null
          pesquisa_id?: string
          plano?: string | null
          respondido_em?: string | null
          token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesquisa_convites_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisa_perguntas: {
        Row: {
          ajuda: string | null
          ativa: boolean
          atualizado_em: string
          codigo: string
          condicao: Json | null
          cor: string | null
          criado_em: string
          enunciado: string
          icone: string | null
          id: string
          max_escolhas: number | null
          obrigatoria: boolean
          opcoes: Json
          ordem: number
          pesquisa_id: string
          secao: string
          tipo: string
        }
        Insert: {
          ajuda?: string | null
          ativa?: boolean
          atualizado_em?: string
          codigo: string
          condicao?: Json | null
          cor?: string | null
          criado_em?: string
          enunciado: string
          icone?: string | null
          id?: string
          max_escolhas?: number | null
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          pesquisa_id: string
          secao?: string
          tipo: string
        }
        Update: {
          ajuda?: string | null
          ativa?: boolean
          atualizado_em?: string
          codigo?: string
          condicao?: Json | null
          cor?: string | null
          criado_em?: string
          enunciado?: string
          icone?: string | null
          id?: string
          max_escolhas?: number | null
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          pesquisa_id?: string
          secao?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pesquisa_perguntas_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisa_respostas: {
        Row: {
          concluida_em: string | null
          convite_id: string | null
          dias_de_assinatura: number | null
          dosha: string | null
          email: string | null
          id: string
          iniciada_em: string
          meta: Json
          origem: string
          pesquisa_id: string
          plano_no_momento: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          concluida_em?: string | null
          convite_id?: string | null
          dias_de_assinatura?: number | null
          dosha?: string | null
          email?: string | null
          id?: string
          iniciada_em?: string
          meta?: Json
          origem?: string
          pesquisa_id: string
          plano_no_momento?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          concluida_em?: string | null
          convite_id?: string | null
          dias_de_assinatura?: number | null
          dosha?: string | null
          email?: string | null
          id?: string
          iniciada_em?: string
          meta?: Json
          origem?: string
          pesquisa_id?: string
          plano_no_momento?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesquisa_respostas_convite_id_fkey"
            columns: ["convite_id"]
            isOneToOne: false
            referencedRelation: "pesquisa_convites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisa_respostas_pesquisa_id_fkey"
            columns: ["pesquisa_id"]
            isOneToOne: false
            referencedRelation: "pesquisas"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisa_respostas_itens: {
        Row: {
          codigo: string
          id: number
          pergunta_id: string | null
          respondido_em: string
          resposta_id: string
          valor_json: Json | null
          valor_num: number | null
          valor_texto: string | null
        }
        Insert: {
          codigo: string
          id?: number
          pergunta_id?: string | null
          respondido_em?: string
          resposta_id: string
          valor_json?: Json | null
          valor_num?: number | null
          valor_texto?: string | null
        }
        Update: {
          codigo?: string
          id?: number
          pergunta_id?: string | null
          respondido_em?: string
          resposta_id?: string
          valor_json?: Json | null
          valor_num?: number | null
          valor_texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pesquisa_respostas_itens_pergunta_id_fkey"
            columns: ["pergunta_id"]
            isOneToOne: false
            referencedRelation: "pesquisa_perguntas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pesquisa_respostas_itens_resposta_id_fkey"
            columns: ["resposta_id"]
            isOneToOne: false
            referencedRelation: "pesquisa_respostas"
            referencedColumns: ["id"]
          },
        ]
      }
      pesquisas: {
        Row: {
          abre_em: string | null
          ativa: boolean
          atualizado_em: string
          criado_em: string
          fecha_em: string | null
          id: string
          intro_html: string | null
          mensagem_final: string | null
          mostrar_banner: boolean
          ordem: number
          publico_rotulo: string
          regras: Json
          slug: string
          subtitulo: string | null
          tempo_estimado_min: number | null
          titulo: string
        }
        Insert: {
          abre_em?: string | null
          ativa?: boolean
          atualizado_em?: string
          criado_em?: string
          fecha_em?: string | null
          id?: string
          intro_html?: string | null
          mensagem_final?: string | null
          mostrar_banner?: boolean
          ordem?: number
          publico_rotulo?: string
          regras?: Json
          slug: string
          subtitulo?: string | null
          tempo_estimado_min?: number | null
          titulo: string
        }
        Update: {
          abre_em?: string | null
          ativa?: boolean
          atualizado_em?: string
          criado_em?: string
          fecha_em?: string | null
          id?: string
          intro_html?: string | null
          mensagem_final?: string | null
          mostrar_banner?: boolean
          ordem?: number
          publico_rotulo?: string
          regras?: Json
          slug?: string
          subtitulo?: string | null
          tempo_estimado_min?: number | null
          titulo?: string
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
      prompt_extrator: {
        Row: {
          corpo: string
          criado_em: string | null
          nota: string | null
          versao: string
        }
        Insert: {
          corpo: string
          criado_em?: string | null
          nota?: string | null
          versao: string
        }
        Update: {
          corpo?: string
          criado_em?: string | null
          nota?: string | null
          versao?: string
        }
        Relationships: []
      }
      receita_ingredientes: {
        Row: {
          alternativas: string[]
          comprar: boolean
          confianca: string | null
          created_at: string
          exibicao: string
          id: string
          ingrediente_id: string | null
          ingrediente_texto: string
          item_original: string | null
          nota: string | null
          nugget_id: string
          opcional: boolean
          ordem: number
          origem_composta: string | null
          papel: string | null
          preparo: string | null
          qtd_original: string | null
          quantidade: number | null
          tamanho: string | null
          unidade: string | null
        }
        Insert: {
          alternativas?: string[]
          comprar?: boolean
          confianca?: string | null
          created_at?: string
          exibicao: string
          id?: string
          ingrediente_id?: string | null
          ingrediente_texto: string
          item_original?: string | null
          nota?: string | null
          nugget_id: string
          opcional?: boolean
          ordem: number
          origem_composta?: string | null
          papel?: string | null
          preparo?: string | null
          qtd_original?: string | null
          quantidade?: number | null
          tamanho?: string | null
          unidade?: string | null
        }
        Update: {
          alternativas?: string[]
          comprar?: boolean
          confianca?: string | null
          created_at?: string
          exibicao?: string
          id?: string
          ingrediente_id?: string | null
          ingrediente_texto?: string
          item_original?: string | null
          nota?: string | null
          nugget_id?: string
          opcional?: boolean
          ordem?: number
          origem_composta?: string | null
          papel?: string | null
          preparo?: string | null
          qtd_original?: string | null
          quantidade?: number | null
          tamanho?: string | null
          unidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receita_ingredientes_ingrediente_id_fkey"
            columns: ["ingrediente_id"]
            isOneToOne: false
            referencedRelation: "ingredientes_catalogo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_ingredientes_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_ingredientes_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "v_receitas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_ingredientes_unidade_fkey"
            columns: ["unidade"]
            isOneToOne: false
            referencedRelation: "unidades_medida"
            referencedColumns: ["unidade"]
          },
        ]
      }
      receita_meta: {
        Row: {
          created_at: string
          nugget_id: string
          receita_base: boolean
          rende_confianca: string | null
          rende_justificativa: string | null
          rende_porcoes: number | null
          revisado_humano: boolean
          tempo_confianca: string | null
          tempo_preparo_min: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          nugget_id: string
          receita_base?: boolean
          rende_confianca?: string | null
          rende_justificativa?: string | null
          rende_porcoes?: number | null
          revisado_humano?: boolean
          tempo_confianca?: string | null
          tempo_preparo_min?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          nugget_id?: string
          receita_base?: boolean
          rende_confianca?: string | null
          rende_justificativa?: string | null
          rende_porcoes?: number | null
          revisado_humano?: boolean
          tempo_confianca?: string | null
          tempo_preparo_min?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receita_meta_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: true
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_meta_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: true
            referencedRelation: "v_receitas"
            referencedColumns: ["id"]
          },
        ]
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
      refino: {
        Row: {
          config: string | null
          criado_em: string | null
          entrou: string | null
          id: number
          pedaco: number | null
          rodada: string | null
          saiu: Json | null
          total_pedacos: number | null
        }
        Insert: {
          config?: string | null
          criado_em?: string | null
          entrou?: string | null
          id?: never
          pedaco?: number | null
          rodada?: string | null
          saiu?: Json | null
          total_pedacos?: number | null
        }
        Update: {
          config?: string | null
          criado_em?: string | null
          entrou?: string | null
          id?: never
          pedaco?: number | null
          rodada?: string | null
          saiu?: Json | null
          total_pedacos?: number | null
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
      resgates_migracao: {
        Row: {
          aluno_externo_id: string | null
          codigo: string
          criado_em: string
          curso_id: string
          data_compra_origem: string | null
          email: string
          id: string
          plataforma_origem: string | null
          tipo: string
          turma_origem: string | null
          updated_at: string
          usado_em: string | null
          usado_por_user_id: string | null
        }
        Insert: {
          aluno_externo_id?: string | null
          codigo: string
          criado_em?: string
          curso_id: string
          data_compra_origem?: string | null
          email: string
          id?: string
          plataforma_origem?: string | null
          tipo: string
          turma_origem?: string | null
          updated_at?: string
          usado_em?: string | null
          usado_por_user_id?: string | null
        }
        Update: {
          aluno_externo_id?: string | null
          codigo?: string
          criado_em?: string
          curso_id?: string
          data_compra_origem?: string | null
          email?: string
          id?: string
          plataforma_origem?: string | null
          tipo?: string
          turma_origem?: string | null
          updated_at?: string
          usado_em?: string | null
          usado_por_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resgates_migracao_aluno_externo_id_fkey"
            columns: ["aluno_externo_id"]
            isOneToOne: false
            referencedRelation: "alunos_plataformas_externas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resgates_migracao_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
      rotina_selecao: {
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
            foreignKeyName: "rotina_selecao_nugget_id_fkey"
            columns: ["nugget_id"]
            isOneToOne: false
            referencedRelation: "rotina_nuggets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rotina_selecao_nugget_id_fkey"
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
          semana: number
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
          semana?: number
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
          semana?: number
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
      ruido_achado: {
        Row: {
          criado_em: string | null
          id: number
          palavra: string | null
          sugestao: string | null
          tema: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: never
          palavra?: string | null
          sugestao?: string | null
          tema?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: never
          palavra?: string | null
          sugestao?: string | null
          tema?: string | null
        }
        Relationships: []
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
      samkhya_karika_verses: {
        Row: {
          book: string
          commentary: string | null
          commentary_attribution_note: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          karika_no: string | null
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          section: string | null
          sequence_no: number
          source_file: string | null
          translation_pt: string | null
          verse_sanskrit: string
        }
        Insert: {
          book?: string
          commentary?: string | null
          commentary_attribution_note?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          karika_no?: string | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          section?: string | null
          sequence_no: number
          source_file?: string | null
          translation_pt?: string | null
          verse_sanskrit: string
        }
        Update: {
          book?: string
          commentary?: string | null
          commentary_attribution_note?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          karika_no?: string | null
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          section?: string | null
          sequence_no?: number
          source_file?: string | null
          translation_pt?: string | null
          verse_sanskrit?: string
        }
        Relationships: []
      }
      seo_sentinela: {
        Row: {
          falhas: Json
          id: number
          medidas: Json
          passou: boolean
          rodado_em: string
        }
        Insert: {
          falhas?: Json
          id?: number
          medidas?: Json
          passou: boolean
          rodado_em?: string
        }
        Update: {
          falhas?: Json
          id?: number
          medidas?: Json
          passou?: boolean
          rodado_em?: string
        }
        Relationships: []
      }
      sharangadhara_verses: {
        Row: {
          adhyaya_no: string | null
          book: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          dipika_commentary: string | null
          editorial_footnote: string | null
          embedding: string | null
          gudhartha_dipika_commentary: string | null
          id: number
          khanda_name: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string
        }
        Insert: {
          adhyaya_no?: string | null
          book?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          dipika_commentary?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          gudhartha_dipika_commentary?: string | null
          id?: never
          khanda_name?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit: string
        }
        Update: {
          adhyaya_no?: string | null
          book?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          dipika_commentary?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          gudhartha_dipika_commentary?: string | null
          id?: never
          khanda_name?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string
        }
        Relationships: []
      }
      sintese_templates: {
        Row: {
          direcao: string
          dosha_alvo: string
          template: string
        }
        Insert: {
          direcao: string
          dosha_alvo: string
          template: string
        }
        Update: {
          direcao?: string
          dosha_alvo?: string
          template?: string
        }
        Relationships: []
      }
      sitemap_ultimo_bom: {
        Row: {
          contagens: Json
          gravado_em: string
          id: number
          urls: number
          xml: string
        }
        Insert: {
          contagens?: Json
          gravado_em?: string
          id?: number
          urls: number
          xml: string
        }
        Update: {
          contagens?: Json
          gravado_em?: string
          id?: number
          urls?: number
          xml?: string
        }
        Relationships: []
      }
      sushruta_verses: {
        Row: {
          book: string
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote_skt: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      sushruta_verses_old_trikamji_v1: {
        Row: {
          book: string
          chapter_name: string | null
          chapter_no: string | null
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote_skt: string | null
          embedding: string | null
          has_lacuna: boolean | null
          id: number
          lacuna_note: string | null
          notes: string | null
          pdf_page: number | null
          sequence_no: number | null
          source_file: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          book?: string
          chapter_name?: string | null
          chapter_no?: string | null
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote_skt?: string | null
          embedding?: string | null
          has_lacuna?: boolean | null
          id?: never
          lacuna_note?: string | null
          notes?: string | null
          pdf_page?: number | null
          sequence_no?: number | null
          source_file?: string | null
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
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
      test_gpt54_vision: {
        Row: {
          created_at: string | null
          id: number
          model: string | null
          pdf_page: number | null
          raw_response: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          model?: string | null
          pdf_page?: number | null
          raw_response?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string | null
          pdf_page?: number | null
          raw_response?: string | null
        }
        Relationships: []
      }
      teste_busca: {
        Row: {
          config: string | null
          detalhe: string | null
          embedding: string | null
          id: number
          pedaco: number | null
          texto: string | null
          topico: string | null
        }
        Insert: {
          config?: string | null
          detalhe?: string | null
          embedding?: string | null
          id?: never
          pedaco?: number | null
          texto?: string | null
          topico?: string | null
        }
        Update: {
          config?: string | null
          detalhe?: string | null
          embedding?: string | null
          id?: never
          pedaco?: number | null
          texto?: string | null
          topico?: string | null
        }
        Relationships: []
      }
      teste_chunk: {
        Row: {
          aula_titulo: string | null
          config: string
          conteudo: string
          embedding: string | null
          id: number
          indice: number | null
          video_id: string
        }
        Insert: {
          aula_titulo?: string | null
          config: string
          conteudo: string
          embedding?: string | null
          id?: never
          indice?: number | null
          video_id: string
        }
        Update: {
          aula_titulo?: string | null
          config?: string
          conteudo?: string
          embedding?: string | null
          id?: never
          indice?: number | null
          video_id?: string
        }
        Relationships: []
      }
      teste_modelo: {
        Row: {
          chunk_id: number | null
          criado_em: string | null
          id: number
          modelo: string | null
          saida: string | null
        }
        Insert: {
          chunk_id?: number | null
          criado_em?: string | null
          id?: never
          modelo?: string | null
          saida?: string | null
        }
        Update: {
          chunk_id?: number | null
          criado_em?: string | null
          id?: never
          modelo?: string | null
          saida?: string | null
        }
        Relationships: []
      }
      teste_pergunta: {
        Row: {
          embedding: string | null
          id: number
          texto: string | null
        }
        Insert: {
          embedding?: string | null
          id?: never
          texto?: string | null
        }
        Update: {
          embedding?: string | null
          id?: never
          texto?: string | null
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
      tutor_chat_histories: {
        Row: {
          data_hora: string | null
          id: number
          message: Json | null
          session_id: string | null
        }
        Insert: {
          data_hora?: string | null
          id?: never
          message?: Json | null
          session_id?: string | null
        }
        Update: {
          data_hora?: string | null
          id?: never
          message?: Json | null
          session_id?: string | null
        }
        Relationships: []
      }
      unidades_medida: {
        Row: {
          familia: string
          g: number | null
          ml: number | null
          ordem: number
          rotulo_plural: string
          rotulo_singular: string
          somavel: boolean
          unidade: string
        }
        Insert: {
          familia: string
          g?: number | null
          ml?: number | null
          ordem?: number
          rotulo_plural: string
          rotulo_singular: string
          somavel?: boolean
          unidade: string
        }
        Update: {
          familia?: string
          g?: number | null
          ml?: number | null
          ordem?: number
          rotulo_plural?: string
          rotulo_singular?: string
          somavel?: boolean
          unidade?: string
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
          email: string | null
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
          email?: string | null
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
          email?: string | null
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
      videos_youtube_indisponiveis: {
        Row: {
          motivo: string
          verificado_em: string
          video_id: string
        }
        Insert: {
          motivo?: string
          verificado_em?: string
          video_id: string
        }
        Update: {
          motivo?: string
          verificado_em?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_tarefas_visao: {
        Row: {
          anexos: Json | null
          arquivada: boolean | null
          atualizado_em: string | null
          concluida_em: string | null
          criado_em: string | null
          criado_por: string | null
          criado_por_email: string | null
          devlog_id: string | null
          devlog_modulo: string | null
          devlog_titulo: string | null
          dias_aberta: number | null
          dias_na_coluna: number | null
          dias_parada: number | null
          funcoes: string[] | null
          id: string | null
          iniciada_em: string | null
          notas: Json | null
          objetivo: string | null
          ordem: number | null
          qtd_anexos: number | null
          qtd_notas: number | null
          status: string | null
          status_em: string | null
          sugerir_arquivar: boolean | null
          temperatura: string | null
          titulo: string | null
          ultima_nota: string | null
          ultima_nota_em: string | null
          urgente: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_tarefas_devlog_id_fkey"
            columns: ["devlog_id"]
            isOneToOne: false
            referencedRelation: "portal_devlog"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_pessoa: {
        Row: {
          cidade: string | null
          dosha_principal: string | null
          elegivel_personalizado: boolean | null
          email: string | null
          estado: string | null
          faixa_etaria: string | null
          idade: number | null
          is_premium: boolean | null
          motivo_supressao: string | null
          na_lista_campanhas: boolean | null
          nivel_evolucao: string | null
          nome: string | null
          plano: string | null
          premium_until: string | null
          sede_predominante: string | null
          subscription_status: string | null
          suprimido: boolean | null
          tem_conta: boolean | null
          tem_teste_dosha: boolean | null
          teste_em: string | null
          teve_problema_entrega: boolean | null
          total_aberturas: number | null
          total_cliques: number | null
          total_envios: number | null
          ultima_abertura_em: string | null
          ultima_comunicacao_id: string | null
          ultima_edicao_enviada: string | null
          ultimo_envio_em: string | null
        }
        Relationships: []
      }
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
      banner_placar: {
        Row: {
          ativo: boolean | null
          cliques: number | null
          ctr_pct: number | null
          id: string | null
          impressoes: number | null
          slot: string | null
          titulo_admin: string | null
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
      pesquisa_perfil_usuario: {
        Row: {
          akasha: number | null
          akasha_texto: string | null
          conteudo: number | null
          dias_de_assinatura: number | null
          dosha: string | null
          email: string | null
          emails: string | null
          livre: string | null
          media_estrelas: number | null
          nav_site: number | null
          pesquisas: string[] | null
          pesquisas_respondidas: number | null
          plano: string | null
          rotina: number | null
          samkhya: string | null
          ultima_resposta_em: string | null
          user_id: string | null
        }
        Relationships: []
      }
      pesquisa_resumo: {
        Row: {
          abriram: number | null
          ativa: boolean | null
          comecaram: number | null
          concluiram: number | null
          convidados: number | null
          enviados: number | null
          estrelas_akasha: number | null
          estrelas_conteudo: number | null
          estrelas_rotina: number | null
          estrelas_site: number | null
          nunca_usou_akasha: number | null
          publico_rotulo: string | null
          slug: string | null
          titulo: string | null
        }
        Insert: {
          abriram?: never
          ativa?: boolean | null
          comecaram?: never
          concluiram?: never
          convidados?: never
          enviados?: never
          estrelas_akasha?: never
          estrelas_conteudo?: never
          estrelas_rotina?: never
          estrelas_site?: never
          nunca_usou_akasha?: never
          publico_rotulo?: string | null
          slug?: string | null
          titulo?: string | null
        }
        Update: {
          abriram?: never
          ativa?: boolean | null
          comecaram?: never
          concluiram?: never
          convidados?: never
          enviados?: never
          estrelas_akasha?: never
          estrelas_conteudo?: never
          estrelas_rotina?: never
          estrelas_site?: never
          nunca_usou_akasha?: never
          publico_rotulo?: string | null
          slug?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      registros_akashikos_publicos: {
        Row: {
          data_postagem: string | null
          id: number | null
          tags: string | null
          texto_inicio: string | null
          texto_resumo: string | null
          titulo: string | null
        }
        Insert: {
          data_postagem?: string | null
          id?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
        }
        Update: {
          data_postagem?: string | null
          id?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
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
      videos_sitemap: {
        Row: {
          criado_em: string | null
          mini_resumo: string | null
          nova_descricao: string | null
          novo_titulo: string | null
          slug: string | null
          video_id: string | null
        }
        Relationships: []
      }
      vw_crm_base: {
        Row: {
          dominio_ok: boolean | null
          dosha: string | null
          email: string | null
          fez_teste: boolean | null
          formacao: boolean | null
          na_lista: boolean | null
          nome: string | null
          pedidos_pagos: number | null
          plano: string | null
          pre_validado: boolean | null
          sabor_domingo: string | null
          segmento: string | null
          sintaxe_ok: boolean | null
          subscription_status: string | null
          supresso: boolean | null
          tem_conta: boolean | null
          ultimo_pedido: string | null
          ultimo_teste: string | null
          whatsapp: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      acervo_stats: { Args: never; Returns: Json }
      admin_agenda_cliques_por_link: {
        Args: { p_comunicacao_id: string; p_dias?: number }
        Returns: {
          cliques: number
          url: string
        }[]
      }
      admin_agenda_dashboard: {
        Args: never
        Returns: {
          aberturas_30d: number
          aberturas_7d: number
          aberturas_hoje: number
          assunto: string
          ativo: boolean
          cliques_30d: number
          cliques_7d: number
          cliques_hoje: number
          cta_url: string
          elegiveis_agora: number
          envios_30d: number
          envios_7d: number
          envios_hoje: number
          envios_total: number
          id: string
          label: string
          nome: string
          publico_dosha: string
          publico_premium: string
          saude: string
          saude_motivo: string
          taxa_abertura_30d: number
          taxa_abertura_7d: number
          taxa_clique_30d: number
          taxa_clique_7d: number
          tipo: string
          tokens_quebrados: string[]
          ultimo_envio_em: string
        }[]
      }
      admin_agenda_edicoes: {
        Args: { p_comunicacao_id: string }
        Returns: {
          aberturas: number
          bounces: number
          cliques: number
          descadastros: number
          edicao: string
          envios: number
          primeiro_envio: string
          taxa_abertura: number
          taxa_clique: number
        }[]
      }
      admin_agenda_tendencia: {
        Args: { p_comunicacao_id: string; p_dias?: number }
        Returns: {
          aberturas: number
          cliques: number
          dia: string
          envios: number
        }[]
      }
      admin_agenda_visao: {
        Args: never
        Returns: {
          assunto: string
          ativo: boolean
          elegiveis_agora: number
          envios_ultimos_30d: number
          id: string
          nome: string
          qtd_secoes: number
          regras: Json
          tem_secoes: boolean
          tipo: string
          ultimo_envio_em: string
        }[]
      }
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
      admin_banners_dashboard: {
        Args: never
        Returns: {
          ativo: boolean
          campanha: string
          cliques_30d: number
          cliques_7d: number
          cliques_hoje: number
          cliques_total: number
          ctr_30d: number
          ctr_7d: number
          id: string
          impressoes_30d: number
          impressoes_7d: number
          impressoes_hoje: number
          impressoes_total: number
          ordem: number
          saude: string
          saude_motivo: string
          slot: string
          titulo_admin: string
          ultima_impressao_em: string
        }[]
      }
      admin_buscar_pessoa: {
        Args: { q: string }
        Returns: {
          dosha_principal: string
          email: string
          nome: string
          plano: string
          tem_teste_dosha: boolean
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
      admin_tarefa_anotar: {
        Args: { p_id: string; p_texto: string }
        Returns: {
          anexos: Json
          arquivada: boolean
          atualizado_em: string
          concluida_em: string | null
          criado_em: string
          criado_por: string | null
          devlog_id: string | null
          funcoes: string[]
          id: string
          iniciada_em: string | null
          notas: Json
          objetivo: string | null
          ordem: number
          status: string
          status_em: string
          titulo: string
          urgente: boolean
        }
        SetofOptions: {
          from: "*"
          to: "admin_tarefas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_tarefa_mover: {
        Args: {
          p_abaixo?: string
          p_acima?: string
          p_id: string
          p_status: string
        }
        Returns: {
          anexos: Json
          arquivada: boolean
          atualizado_em: string
          concluida_em: string | null
          criado_em: string
          criado_por: string | null
          devlog_id: string | null
          funcoes: string[]
          id: string
          iniciada_em: string | null
          notas: Json
          objetivo: string | null
          ordem: number
          status: string
          status_em: string
          titulo: string
          urgente: boolean
        }
        SetofOptions: {
          from: "*"
          to: "admin_tarefas"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_tarefas_anexos_ok: { Args: { p: Json }; Returns: boolean }
      admin_tarefas_arquivar_antigas: { Args: never; Returns: number }
      admin_tarefas_funcoes_canonicas: {
        Args: { p: string[] }
        Returns: string[]
      }
      agenda_destinatarios: {
        Args: { p_comunicacao_id: string }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      agenda_destinatarios_compra: {
        Args: { p_comunicacao_id: string }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      agenda_dia_ayurveda: { Args: { p_registro_id: string }; Returns: Json }
      agenda_dominical: {
        Args: { p_limite?: number }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      agenda_elegiveis_count: {
        Args: { p_comunicacao_id: string }
        Returns: number
      }
      agenda_kit_refeicoes: {
        Args: { p_alvo: string; p_registro_id: string }
        Returns: Json
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
      antiruido_ayurveda: { Args: { t: string }; Returns: string }
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
      auditoria_amostra_emails: { Args: { p_horas?: number }; Returns: Json }
      auditoria_relatorio_qualidade: {
        Args: { p_horas?: number }
        Returns: Json
      }
      auditoria_sugestao_conteudo: { Args: { p_email: string }; Returns: Json }
      bulk_update_translation: {
        Args: { items: Json; target_table: string }
        Returns: number
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
      buscar_artigo: {
        Args: { p_dosha?: string; p_termo?: string }
        Returns: {
          imagem_url: string
          link: string
          publicado_em: string
          resumo: string
          titulo: string
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
      buscar_video: {
        Args: { p_dosha?: string; p_termo?: string }
        Returns: {
          imagem_url: string
          link: string
          resumo: string
          tags: string
          titulo: string
        }[]
      }
      bytea_to_text: { Args: { data: string }; Returns: string }
      calc_dosha_status: {
        Args: { dosha: string; score: number }
        Returns: string
      }
      calcular_sintese_texto: { Args: { p_email: string }; Returns: string }
      cancelar_assinaturas_pix_vencidas: { Args: never; Returns: undefined }
      cards_da_resposta: {
        Args: { p_texto: string }
        Returns: {
          hits: number
          imagem: string
          link: string
          preco: number
          tipo: string
          titulo: string
        }[]
      }
      claim_dosha_test: { Args: { p_id_publico?: string }; Returns: Json }
      coletar_dados_sintese_mensal: { Args: { p_email: string }; Returns: Json }
      confirmar_assinatura_pix: {
        Args: { p_mp_payment_id: string }
        Returns: Json
      }
      confirmar_cobranca_pix: {
        Args: { p_mp_payment_id: string }
        Returns: Json
      }
      confirmar_pagamento_cartao_mp: {
        Args: { p_external_reference: string; p_mp_payment_id: string }
        Returns: Json
      }
      confirmar_pagamento_curso_mp: {
        Args: {
          p_external_reference: string
          p_mp_payment_id: string
          p_valor?: number
        }
        Returns: Json
      }
      confirmar_pagamento_pix: {
        Args: { p_mp_payment_id: string }
        Returns: Json
      }
      corrigir_grafia: { Args: { t: string }; Returns: string }
      cortar_nas_ancoras: {
        Args: { p_ancoras: string[]; p_texto: string }
        Returns: {
          achou: boolean
          conteudo: string
          indice: number
        }[]
      }
      criar_convite_avaliacao_produto: {
        Args: { p_pedido_id: string }
        Returns: string
      }
      descadastro_confirmar: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      descadastro_token: { Args: { p_email: string }; Returns: string }
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
      fatiar_texto: {
        Args: { p_sobra?: number; p_tam?: number; p_texto: string }
        Returns: {
          conteudo: string
          indice: number
        }[]
      }
      fila_destravar: { Args: never; Returns: number }
      fila_estado: {
        Args: never
        Returns: {
          com_vetor: number
          erro: number
          fichas: number
          ok: number
          pendente: number
          processando: number
        }[]
      }
      fila_fechar_aula: {
        Args: { p_chunks?: number; p_erro?: string; p_video_id: string }
        Returns: undefined
      }
      fila_gravar_texto: {
        Args: { p_texto: string; p_video_id: string }
        Returns: number
      }
      fila_liberar_apenas: {
        Args: { p_curso: string }
        Returns: {
          liberadas: number
          pausadas: number
        }[]
      }
      fila_proxima_aula_fatiada: { Args: never; Returns: Json }
      fila_proximas_aulas: {
        Args: { qtd?: number }
        Returns: {
          aula_titulo: string
          chars_limpos: number
          cursos: string[]
          modulo_titulo: string
          tema: string
          texto_limpo: string
          video_id: string
        }[]
      }
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
      fmt_qtd: { Args: { q: number }; Returns: string }
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
      girar_rotinas_lote: { Args: { p_tamanho?: number }; Returns: number }
      girar_rotinas_mensal: { Args: never; Returns: number }
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
      ingerir_lote_cursos: {
        Args: { p_ate: number; p_de: number; p_lote_embed?: number }
        Returns: Json
      }
      is_admin: { Args: never; Returns: boolean }
      jiva_concluir: {
        Args: { total: number; vid: string }
        Returns: undefined
      }
      jiva_proximo_video: {
        Args: never
        Returns: {
          is_live: boolean
          legenda: string
          origem: string
          titulo: string
          video_id: string
        }[]
      }
      jogo_nivel_de: {
        Args: { p_email: string }
        Returns: {
          nivel_nome: string
          nivel_ordem: number
          xp_total: number
        }[]
      }
      kit_detalhe: { Args: { p_slug: string }; Returns: Json }
      kit_expandir: {
        Args: { p_escolhas?: Json; p_slug: string }
        Returns: Json
      }
      lista_de_compras: {
        Args: {
          p_nugget_ids?: string[]
          p_pessoas?: number
          p_teste_id: string
        }
        Returns: {
          confianca: string
          despensa: boolean
          ingrediente: string
          opcional: boolean
          quantidade_texto: string
          receitas: string[]
          setor: string
          setor_ordem: number
          sugestao_troca: string
          tem_estimativa: boolean
          unidade_compra: string
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
      match_documents_cursos: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
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
      meus_agravamentos: {
        Args: never
        Returns: {
          dosha: string
          prioridade: number
          sintoma: string
        }[]
      }
      minha_rotina_por_teste: {
        Args: { p_teste_id: string }
        Returns: {
          dia: number
          id: string
          nugget_id: string
          praticado: boolean
          semana: number
          slot: string
        }[]
      }
      mockups_dados: { Args: never; Returns: Json }
      obter_certificado_curso: { Args: { p_curso_id: string }; Returns: Json }
      owns_rotina: { Args: { p_test_id: string }; Returns: boolean }
      payload_pessoa_preview: {
        Args: { p_comunicacao_id: string; p_email: string }
        Returns: Json
      }
      pesquisa_abrir: {
        Args: { p_slug: string; p_token?: string }
        Returns: Json
      }
      pesquisa_destinatarios: {
        Args: { p_limite?: number; p_slug: string }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      pesquisa_elegivel: { Args: { p_slug: string }; Returns: Json }
      pesquisa_marcar_enviado: {
        Args: { p_email: string; p_slug: string }
        Returns: boolean
      }
      pesquisa_minha: { Args: never; Returns: Json }
      pesquisa_publico: {
        Args: { p_slug: string }
        Returns: {
          dias_de_assinatura: number
          dosha: string
          email: string
          nome: string
          plano: string
          user_id: string
        }[]
      }
      pesquisa_responder: {
        Args: {
          p_concluir?: boolean
          p_itens: Json
          p_origem?: string
          p_slug: string
          p_token?: string
        }
        Returns: Json
      }
      prateleira_samkhya: {
        Args: { p_dosha?: string }
        Returns: {
          imagem: string
          nome: string
          preco: number
          resumo: string
          rota: string
          slug: string
        }[]
      }
      preparar_login_contexto: {
        Args: { p_contexto: string; p_email: string }
        Returns: undefined
      }
      produtos_relacionados: {
        Args: { p_limite?: number; p_slug: string }
        Returns: {
          imagem: string
          nome: string
          pontos: number
          preco: number
          resumo: string
          slug: string
        }[]
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
      receitas_para_impressao: {
        Args: { p_nugget_ids: string[] }
        Returns: {
          dicas: string
          dravya_guna: Json
          efeito_esperado: string
          imagem_url: string
          ingredientes: Json
          kapha: number
          modo_preparo: Json
          nugget_id: string
          pitta: number
          rende_porcoes: number
          resumo: string
          slug: string
          subcategoria: string
          tempo_preparo_min: number
          titulo: string
          vata: number
        }[]
      }
      recompute_user_level: { Args: { p_user: string }; Returns: undefined }
      registrar_evento_email: { Args: { p: Json }; Returns: number }
      relatorio_dossie: { Args: { p_horas?: number }; Returns: Json }
      renderizar_secoes_email: {
        Args: { p_comunicacao_id: string }
        Returns: string
      }
      resgatar_codigo_migracao: { Args: { p_codigo: string }; Returns: Json }
      restaurar_creditos_pedido_desculpas: {
        Args: { p_email: string }
        Returns: number
      }
      restore_dosha_test_version: {
        Args: { _version_number: number }
        Returns: undefined
      }
      resultado_teste: {
        Args: { p_idpublico: string }
        Returns: {
          agniPrincipal: string
          agravKaphaTags: string
          agravPittaTags: string
          agravVataTags: string
          altura: string
          cidade: string
          conhecimentoAyurveda: string
          created_at: string
          doshaprincipal: string
          email: string
          estado: string
          id: string
          idade: number
          imc: number
          kaphascore: number
          nome: string
          pais: string
          peso: string
          pittascore: number
          vatascore: number
        }[]
      }
      rodar_hipotese: {
        Args: {
          p_modelo: string
          p_rodada: string
          p_sobra: number
          p_tam: number
          p_versao: string
          p_video: string
        }
        Returns: string
      }
      rodar_hipotese2: {
        Args: {
          p_ctx_saida?: boolean
          p_modelo: string
          p_rodada: string
          p_sobra: number
          p_tam: number
          p_versao: string
          p_video: string
        }
        Returns: string
      }
      rodar_hipotese3: {
        Args: {
          p_ate?: number
          p_ctx_saida?: boolean
          p_de?: number
          p_modelo: string
          p_rodada: string
          p_sobra: number
          p_tam: number
          p_versao: string
          p_video: string
        }
        Returns: string
      }
      rotina_para_impressao: {
        Args: { p_teste_id: string }
        Returns: {
          categoria: string
          dia: number
          dicas: string
          efeito_esperado: string
          eh_receita: boolean
          icone: string
          imagem_url: string
          ingredientes: Json
          modo_preparo: Json
          nugget_id: string
          praticado: boolean
          rende_porcoes: number
          resumo: string
          slot: string
          subcategoria: string
          tempo_preparo_min: number
          titulo: string
        }[]
      }
      rpg_admin_select: { Args: { _table: string }; Returns: Json }
      rpg_play: { Args: { _args?: Json; _fn: string }; Returns: Json }
      rpg_rpc: { Args: { _args?: Json; _fn: string }; Returns: Json }
      sede_predominante_dosha: {
        Args: { p_dosha: string; p_tags: string }
        Returns: string
      }
      seo_conteudo: { Args: { p_path: string }; Returns: Json }
      seo_meta: { Args: { p_path: string }; Returns: Json }
      seo_slug_video: { Args: { p_titulo: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
      video_slug_sitemap: { Args: { p_titulo: string }; Returns: string }
      videos_seo2_sincronizar: { Args: never; Returns: number }
      videos_slugify: { Args: { p_titulo: string }; Returns: string }
      vtt_para_texto: { Args: { legenda: string }; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
