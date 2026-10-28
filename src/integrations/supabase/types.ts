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
      _bkp_curso_diplomas_20261013: {
        Row: {
          carga_horaria: string | null
          cor_acento: string | null
          cor_clara: string | null
          cor_escura: string | null
          cor_primaria: string | null
          created_at: string | null
          curso_id: string | null
          id: string | null
          logo_url: string | null
          n_aulas: number | null
          n_modulos: number | null
          nome_exibicao: string | null
          texto_certificado: string | null
          updated_at: string | null
        }
        Insert: {
          carga_horaria?: string | null
          cor_acento?: string | null
          cor_clara?: string | null
          cor_escura?: string | null
          cor_primaria?: string | null
          created_at?: string | null
          curso_id?: string | null
          id?: string | null
          logo_url?: string | null
          n_aulas?: number | null
          n_modulos?: number | null
          nome_exibicao?: string | null
          texto_certificado?: string | null
          updated_at?: string | null
        }
        Update: {
          carga_horaria?: string | null
          cor_acento?: string | null
          cor_clara?: string | null
          cor_escura?: string | null
          cor_primaria?: string | null
          created_at?: string | null
          curso_id?: string | null
          id?: string | null
          logo_url?: string | null
          n_aulas?: number | null
          n_modulos?: number | null
          nome_exibicao?: string | null
          texto_certificado?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bkp_detox_aula3_remarcada_20261019: {
        Row: {
          linha: Json | null
          tabela: string | null
        }
        Insert: {
          linha?: Json | null
          tabela?: string | null
        }
        Update: {
          linha?: Json | null
          tabela?: string | null
        }
        Relationships: []
      }
      _bkp_detox_cardapios_20261013b: {
        Row: {
          html: string | null
          id: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          html?: string | null
          id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          html?: string | null
          id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bkp_detox_curso_20261013: {
        Row: {
          created_at: string | null
          descricao: string | null
          duracao_segundos: number | null
          html: string | null
          id: string | null
          imprimir: boolean | null
          libera_em: string | null
          liberada: boolean | null
          modulo_id: string | null
          ordem: number | null
          slug: string | null
          titulo: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          duracao_segundos?: number | null
          html?: string | null
          id?: string | null
          imprimir?: boolean | null
          libera_em?: string | null
          liberada?: boolean | null
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
          titulo?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          duracao_segundos?: number | null
          html?: string | null
          id?: string | null
          imprimir?: boolean | null
          libera_em?: string | null
          liberada?: boolean | null
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
          titulo?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      _bkp_detox_elixir_coar_20261017: {
        Row: {
          conteudo: string | null
          id: string | null
          tabela: string | null
        }
        Insert: {
          conteudo?: string | null
          id?: string | null
          tabela?: string | null
        }
        Update: {
          conteudo?: string | null
          id?: string | null
          tabela?: string | null
        }
        Relationships: []
      }
      _bkp_detox_encontro7_20261019: {
        Row: {
          linha: Json | null
          tabela: string | null
        }
        Insert: {
          linha?: Json | null
          tabela?: string | null
        }
        Update: {
          linha?: Json | null
          tabela?: string | null
        }
        Relationships: []
      }
      _bkp_detox_material_20261013: {
        Row: {
          content: string | null
          id: number | null
          rotulo: string | null
        }
        Insert: {
          content?: string | null
          id?: number | null
          rotulo?: string | null
        }
        Update: {
          content?: string | null
          id?: number | null
          rotulo?: string | null
        }
        Relationships: []
      }
      _bkp_detox_modulos_20261013: {
        Row: {
          created_at: string | null
          curso_id: string | null
          descricao: string | null
          id: string | null
          ordem: number | null
          tipo: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          id?: string | null
          ordem?: number | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string | null
          descricao?: string | null
          id?: string | null
          ordem?: number | null
          tipo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _bkp_funcoes_20261013: {
        Row: {
          definicao: string
          guardado_em: string | null
          nome: string
        }
        Insert: {
          definicao: string
          guardado_em?: string | null
          nome: string
        }
        Update: {
          definicao?: string
          guardado_em?: string | null
          nome?: string
        }
        Relationships: []
      }
      _bkp_objetivos_agni_20261007: {
        Row: {
          agni_nivel_atual: number | null
          agni_nivel_meta: number | null
          id: string | null
        }
        Insert: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          id?: string | null
        }
        Update: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          id?: string | null
        }
        Relationships: []
      }
      _bkp_portal_terapeutas_20261021: {
        Row: {
          cidade: string | null
          "created date": string | null
          email: string | null
          especialidade: string | null
          estado: string | null
          formado_desde: number | null
          id: string | null
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
          id?: string | null
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
          id?: string | null
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
      _bkp_reteste_20261007: {
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
          created_at: string | null
          criado_por: string | null
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_path: string | null
          foto_lingua_url: string | null
          id: string | null
          idade: number | null
          idPublico: string | null
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
          tipo: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
          user_id?: string | null
          vatascore?: number | null
        }
        Relationships: []
      }
      _bkp_reteste_duplicados_20261007: {
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
          created_at: string | null
          criado_por: string | null
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_path: string | null
          foto_lingua_url: string | null
          id: string | null
          idade: number | null
          idPublico: string | null
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
          rn: number | null
          texto_ia: string | null
          tipo: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          rn?: number | null
          texto_ia?: string | null
          tipo?: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          rn?: number | null
          texto_ia?: string | null
          tipo?: string | null
          user_id?: string | null
          vatascore?: number | null
        }
        Relationships: []
      }
      _bkp_reteste_duplicados_rotinas_20261007: {
        Row: {
          created_at: string | null
          dia: number | null
          id: string | null
          nugget_id: string | null
          praticado: boolean | null
          semana: number | null
          slot: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      _bkp_videos_repetidos_20261016: {
        Row: {
          chave: string | null
          coluna: string | null
          gravado_em: string | null
          tabela: string | null
          valor_antigo: string | null
        }
        Insert: {
          chave?: string | null
          coluna?: string | null
          gravado_em?: string | null
          tabela?: string | null
          valor_antigo?: string | null
        }
        Update: {
          chave?: string | null
          coluna?: string | null
          gravado_em?: string | null
          tabela?: string | null
          valor_antigo?: string | null
        }
        Relationships: []
      }
      acomp_paginas: {
        Row: {
          atualizado_em: string
          html: string
          slug: string
        }
        Insert: {
          atualizado_em?: string
          html: string
          slug: string
        }
        Update: {
          atualizado_em?: string
          html?: string
          slug?: string
        }
        Relationships: []
      }
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
          agni_nivel: number | null
          agni_tipo: string | null
          data_postagem: string | null
          email: string | null
          id: number
          kapha_score: number | null
          pitta_score: number | null
          tags: string | null
          texto_inicio: string | null
          texto_resumo: string | null
          titulo: string | null
          user_id: string | null
          vata_score: number | null
        }
        Insert: {
          agni_nivel?: number | null
          agni_tipo?: string | null
          data_postagem?: string | null
          email?: string | null
          id?: number
          kapha_score?: number | null
          pitta_score?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
          user_id?: string | null
          vata_score?: number | null
        }
        Update: {
          agni_nivel?: number | null
          agni_tipo?: string | null
          data_postagem?: string | null
          email?: string | null
          id?: number
          kapha_score?: number | null
          pitta_score?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
          user_id?: string | null
          vata_score?: number | null
        }
        Relationships: []
      }
      akasha_perguntas_dosha: {
        Row: {
          ativo: boolean
          created_at: string
          grupo: string
          id: number
          ordem: number
          pergunta: string
          resposta: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          grupo: string
          id?: number
          ordem: number
          pergunta: string
          resposta?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          grupo?: string
          id?: number
          ordem?: number
          pergunta?: string
          resposta?: string | null
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
      alunos_config: {
        Row: {
          atualizado_em: string
          chave: string
          descricao: string | null
          valor: Json
        }
        Insert: {
          atualizado_em?: string
          chave: string
          descricao?: string | null
          valor: Json
        }
        Update: {
          atualizado_em?: string
          chave?: string
          descricao?: string | null
          valor?: Json
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
      aniversarios_dias: {
        Row: {
          conselho: string | null
          created_at: string
          dia: number
          dia_chave: string
          elemento_qualidade: string | null
          meditacao: string | null
          mes: number
          mes_nome: string
          nascidos_neste_dia: string | null
          numeros_planetas: string | null
          observacao: string | null
          ordem: number
          pag_principal: number | null
          pag_secoes: number | null
          palavras_negativas: string[]
          palavras_positivas: string[]
          periodo: string | null
          saude: string | null
          signo: string | null
          signo_graus: string | null
          taro: string | null
          texto_principal: string | null
          titulo_data: string | null
          titulo_dia: string | null
        }
        Insert: {
          conselho?: string | null
          created_at?: string
          dia: number
          dia_chave: string
          elemento_qualidade?: string | null
          meditacao?: string | null
          mes: number
          mes_nome: string
          nascidos_neste_dia?: string | null
          numeros_planetas?: string | null
          observacao?: string | null
          ordem: number
          pag_principal?: number | null
          pag_secoes?: number | null
          palavras_negativas?: string[]
          palavras_positivas?: string[]
          periodo?: string | null
          saude?: string | null
          signo?: string | null
          signo_graus?: string | null
          taro?: string | null
          texto_principal?: string | null
          titulo_data?: string | null
          titulo_dia?: string | null
        }
        Update: {
          conselho?: string | null
          created_at?: string
          dia?: number
          dia_chave?: string
          elemento_qualidade?: string | null
          meditacao?: string | null
          mes?: number
          mes_nome?: string
          nascidos_neste_dia?: string | null
          numeros_planetas?: string | null
          observacao?: string | null
          ordem?: number
          pag_principal?: number | null
          pag_secoes?: number | null
          palavras_negativas?: string[]
          palavras_positivas?: string[]
          periodo?: string | null
          saude?: string | null
          signo?: string | null
          signo_graus?: string | null
          taro?: string | null
          texto_principal?: string | null
          titulo_data?: string | null
          titulo_dia?: string | null
        }
        Relationships: []
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
      assinar_eventos: {
        Row: {
          criado_em: string
          evento: string
          id: number
          origem: string | null
          pagina: string | null
          plano: string | null
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          evento: string
          id?: number
          origem?: string | null
          pagina?: string | null
          plano?: string | null
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          evento?: string
          id?: number
          origem?: string | null
          pagina?: string | null
          plano?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assinatura_cancelamentos_admin: {
        Row: {
          acesso_ate: string | null
          assinatura_id: string
          criado_em: string
          criado_por: string
          feito_em: string | null
          id: string
          motivo: string | null
          resposta: Json | null
          status: string
        }
        Insert: {
          acesso_ate?: string | null
          assinatura_id: string
          criado_em?: string
          criado_por?: string
          feito_em?: string | null
          id?: string
          motivo?: string | null
          resposta?: Json | null
          status?: string
        }
        Update: {
          acesso_ate?: string | null
          assinatura_id?: string
          criado_em?: string
          criado_por?: string
          feito_em?: string | null
          id?: string
          motivo?: string | null
          resposta?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "assinatura_cancelamentos_admin_assinatura_id_fkey"
            columns: ["assinatura_id"]
            isOneToOne: false
            referencedRelation: "assinaturas"
            referencedColumns: ["id"]
          },
        ]
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
      atividade_abas: {
        Row: {
          ativa: boolean
          created_at: string
          curso_id: string | null
          escola_modulo_id: string | null
          icone: string
          id: string
          ordem: number
          titulo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          curso_id?: string | null
          escola_modulo_id?: string | null
          icone?: string
          id?: string
          ordem?: number
          titulo: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          curso_id?: string | null
          escola_modulo_id?: string | null
          icone?: string
          id?: string
          ordem?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_abas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividade_abas_escola_modulo_id_fkey"
            columns: ["escola_modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
      }
      atividade_perguntas: {
        Row: {
          ajuda: string | null
          ativa: boolean
          atividade_id: string
          codigo: string
          config: Json
          created_at: string
          enunciado: string
          id: string
          obrigatoria: boolean
          opcoes: Json
          ordem: number
          secao: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ajuda?: string | null
          ativa?: boolean
          atividade_id: string
          codigo: string
          config?: Json
          created_at?: string
          enunciado?: string
          id?: string
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          secao?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ajuda?: string | null
          ativa?: boolean
          atividade_id?: string
          codigo?: string
          config?: Json
          created_at?: string
          enunciado?: string
          id?: string
          obrigatoria?: boolean
          opcoes?: Json
          ordem?: number
          secao?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_perguntas_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      atividade_respostas: {
        Row: {
          atividade_id: string
          created_at: string
          entregue_em: string | null
          id: string
          respostas: Json
          resultado: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          atividade_id: string
          created_at?: string
          entregue_em?: string | null
          id?: string
          respostas?: Json
          resultado?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          atividade_id?: string
          created_at?: string
          entregue_em?: string | null
          id?: string
          respostas?: Json
          resultado?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_respostas_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          aba_id: string | null
          ativa: boolean
          config: Json
          created_at: string
          curso_id: string | null
          escola_modulo_id: string | null
          id: string
          intro_html: string | null
          mensagem_final: string | null
          ordem: number
          prazo: string | null
          slug: string | null
          subtitulo: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          aba_id?: string | null
          ativa?: boolean
          config?: Json
          created_at?: string
          curso_id?: string | null
          escola_modulo_id?: string | null
          id?: string
          intro_html?: string | null
          mensagem_final?: string | null
          ordem?: number
          prazo?: string | null
          slug?: string | null
          subtitulo?: string | null
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          aba_id?: string | null
          ativa?: boolean
          config?: Json
          created_at?: string
          curso_id?: string | null
          escola_modulo_id?: string | null
          id?: string
          intro_html?: string | null
          mensagem_final?: string | null
          ordem?: number
          prazo?: string | null
          slug?: string | null
          subtitulo?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_aba_id_fkey"
            columns: ["aba_id"]
            isOneToOne: false
            referencedRelation: "atividade_abas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_escola_modulo_id_fkey"
            columns: ["escola_modulo_id"]
            isOneToOne: false
            referencedRelation: "escola_modulos"
            referencedColumns: ["id"]
          },
        ]
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
      backup_indicacoes_secoes_20261027: {
        Row: {
          atualizado_em: string | null
          chave: string | null
          descricao: string | null
          valor: Json | null
        }
        Insert: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
        }
        Update: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
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
      backup_objetivo_edsonayurveda_20261026: {
        Row: {
          agni_nivel_atual: number | null
          agni_nivel_meta: number | null
          agni_tipo: string | null
          alimentos_kapha_atual: number | null
          alimentos_kapha_meta: number | null
          alimentos_pitta_atual: number | null
          alimentos_pitta_meta: number | null
          alimentos_vata_atual: number | null
          alimentos_vata_meta: number | null
          causas: Json | null
          created_at: string | null
          dados_completos_llm: Json | null
          data_fim: string | null
          data_inicio: string | null
          dosha_registro_id: string | null
          frase_clinica: string | null
          id: string | null
          idade: number | null
          imc_atual: number | null
          imc_meta: number | null
          kapha_atual: number | null
          kapha_meta: number | null
          kapha_status: string | null
          n8n_response: Json | null
          narrativa_clinica: Json | null
          narrativa_enqueued_at: string | null
          o_que_e: string | null
          objetivos: Json | null
          objetivos_status: Json | null
          pitta_atual: number | null
          pitta_meta: number | null
          pitta_status: string | null
          primario_slug: string | null
          primario_tipo: string | null
          status: string | null
          suplementar_slug: string | null
          upgrade_kit_slug: string | null
          user_email: string | null
          vata_atual: number | null
          vata_meta: number | null
          vata_status: string | null
        }
        Insert: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          agni_tipo?: string | null
          alimentos_kapha_atual?: number | null
          alimentos_kapha_meta?: number | null
          alimentos_pitta_atual?: number | null
          alimentos_pitta_meta?: number | null
          alimentos_vata_atual?: number | null
          alimentos_vata_meta?: number | null
          causas?: Json | null
          created_at?: string | null
          dados_completos_llm?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          dosha_registro_id?: string | null
          frase_clinica?: string | null
          id?: string | null
          idade?: number | null
          imc_atual?: number | null
          imc_meta?: number | null
          kapha_atual?: number | null
          kapha_meta?: number | null
          kapha_status?: string | null
          n8n_response?: Json | null
          narrativa_clinica?: Json | null
          narrativa_enqueued_at?: string | null
          o_que_e?: string | null
          objetivos?: Json | null
          objetivos_status?: Json | null
          pitta_atual?: number | null
          pitta_meta?: number | null
          pitta_status?: string | null
          primario_slug?: string | null
          primario_tipo?: string | null
          status?: string | null
          suplementar_slug?: string | null
          upgrade_kit_slug?: string | null
          user_email?: string | null
          vata_atual?: number | null
          vata_meta?: number | null
          vata_status?: string | null
        }
        Update: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          agni_tipo?: string | null
          alimentos_kapha_atual?: number | null
          alimentos_kapha_meta?: number | null
          alimentos_pitta_atual?: number | null
          alimentos_pitta_meta?: number | null
          alimentos_vata_atual?: number | null
          alimentos_vata_meta?: number | null
          causas?: Json | null
          created_at?: string | null
          dados_completos_llm?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          dosha_registro_id?: string | null
          frase_clinica?: string | null
          id?: string | null
          idade?: number | null
          imc_atual?: number | null
          imc_meta?: number | null
          kapha_atual?: number | null
          kapha_meta?: number | null
          kapha_status?: string | null
          n8n_response?: Json | null
          narrativa_clinica?: Json | null
          narrativa_enqueued_at?: string | null
          o_que_e?: string | null
          objetivos?: Json | null
          objetivos_status?: Json | null
          pitta_atual?: number | null
          pitta_meta?: number | null
          pitta_status?: string | null
          primario_slug?: string | null
          primario_tipo?: string | null
          status?: string | null
          suplementar_slug?: string | null
          upgrade_kit_slug?: string | null
          user_email?: string | null
          vata_atual?: number | null
          vata_meta?: number | null
          vata_status?: string | null
        }
        Relationships: []
      }
      backup_objetivo_portalayurveda_20261026: {
        Row: {
          agni_nivel_atual: number | null
          agni_nivel_meta: number | null
          agni_tipo: string | null
          alimentos_kapha_atual: number | null
          alimentos_kapha_meta: number | null
          alimentos_pitta_atual: number | null
          alimentos_pitta_meta: number | null
          alimentos_vata_atual: number | null
          alimentos_vata_meta: number | null
          causas: Json | null
          created_at: string | null
          dados_completos_llm: Json | null
          data_fim: string | null
          data_inicio: string | null
          dosha_registro_id: string | null
          frase_clinica: string | null
          id: string | null
          idade: number | null
          imc_atual: number | null
          imc_meta: number | null
          kapha_atual: number | null
          kapha_meta: number | null
          kapha_status: string | null
          n8n_response: Json | null
          narrativa_clinica: Json | null
          narrativa_enqueued_at: string | null
          o_que_e: string | null
          objetivos: Json | null
          objetivos_status: Json | null
          pitta_atual: number | null
          pitta_meta: number | null
          pitta_status: string | null
          primario_slug: string | null
          primario_tipo: string | null
          status: string | null
          suplementar_slug: string | null
          upgrade_kit_slug: string | null
          user_email: string | null
          vata_atual: number | null
          vata_meta: number | null
          vata_status: string | null
        }
        Insert: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          agni_tipo?: string | null
          alimentos_kapha_atual?: number | null
          alimentos_kapha_meta?: number | null
          alimentos_pitta_atual?: number | null
          alimentos_pitta_meta?: number | null
          alimentos_vata_atual?: number | null
          alimentos_vata_meta?: number | null
          causas?: Json | null
          created_at?: string | null
          dados_completos_llm?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          dosha_registro_id?: string | null
          frase_clinica?: string | null
          id?: string | null
          idade?: number | null
          imc_atual?: number | null
          imc_meta?: number | null
          kapha_atual?: number | null
          kapha_meta?: number | null
          kapha_status?: string | null
          n8n_response?: Json | null
          narrativa_clinica?: Json | null
          narrativa_enqueued_at?: string | null
          o_que_e?: string | null
          objetivos?: Json | null
          objetivos_status?: Json | null
          pitta_atual?: number | null
          pitta_meta?: number | null
          pitta_status?: string | null
          primario_slug?: string | null
          primario_tipo?: string | null
          status?: string | null
          suplementar_slug?: string | null
          upgrade_kit_slug?: string | null
          user_email?: string | null
          vata_atual?: number | null
          vata_meta?: number | null
          vata_status?: string | null
        }
        Update: {
          agni_nivel_atual?: number | null
          agni_nivel_meta?: number | null
          agni_tipo?: string | null
          alimentos_kapha_atual?: number | null
          alimentos_kapha_meta?: number | null
          alimentos_pitta_atual?: number | null
          alimentos_pitta_meta?: number | null
          alimentos_vata_atual?: number | null
          alimentos_vata_meta?: number | null
          causas?: Json | null
          created_at?: string | null
          dados_completos_llm?: Json | null
          data_fim?: string | null
          data_inicio?: string | null
          dosha_registro_id?: string | null
          frase_clinica?: string | null
          id?: string | null
          idade?: number | null
          imc_atual?: number | null
          imc_meta?: number | null
          kapha_atual?: number | null
          kapha_meta?: number | null
          kapha_status?: string | null
          n8n_response?: Json | null
          narrativa_clinica?: Json | null
          narrativa_enqueued_at?: string | null
          o_que_e?: string | null
          objetivos?: Json | null
          objetivos_status?: Json | null
          pitta_atual?: number | null
          pitta_meta?: number | null
          pitta_status?: string | null
          primario_slug?: string | null
          primario_tipo?: string | null
          status?: string | null
          suplementar_slug?: string | null
          upgrade_kit_slug?: string | null
          user_email?: string | null
          vata_atual?: number | null
          vata_meta?: number | null
          vata_status?: string | null
        }
        Relationships: []
      }
      backup_rotina_edsonayurveda_20261026: {
        Row: {
          created_at: string | null
          dia: number | null
          id: string | null
          nugget_id: string | null
          praticado: boolean | null
          semana: number | null
          slot: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_rotina_portalayurveda_20261026: {
        Row: {
          created_at: string | null
          dia: number | null
          id: string | null
          nugget_id: string | null
          praticado: boolean | null
          semana: number | null
          slot: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dia?: number | null
          id?: string | null
          nugget_id?: string | null
          praticado?: boolean | null
          semana?: number | null
          slot?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      backup_sessao_portalayurveda_20261026: {
        Row: {
          created_at: string | null
          direcao_check_in: string | null
          dosha_registro_origem_id: string | null
          id: string | null
          momento: number | null
          pack_perguntas: Json | null
          perguntas_subsecao: number | null
          questao_atual: number | null
          relato_abertura: string | null
          respostas_raw: Json | null
          resultado: Json | null
          seed: Json | null
          sinais_agni: number | null
          sinais_ama: number | null
          sinais_kapha: number | null
          sinais_pitta: number | null
          sinais_vata: number | null
          status: string | null
          subsecao: string | null
          total_sinais: number | null
          updated_at: string | null
          user_email: string | null
        }
        Insert: {
          created_at?: string | null
          direcao_check_in?: string | null
          dosha_registro_origem_id?: string | null
          id?: string | null
          momento?: number | null
          pack_perguntas?: Json | null
          perguntas_subsecao?: number | null
          questao_atual?: number | null
          relato_abertura?: string | null
          respostas_raw?: Json | null
          resultado?: Json | null
          seed?: Json | null
          sinais_agni?: number | null
          sinais_ama?: number | null
          sinais_kapha?: number | null
          sinais_pitta?: number | null
          sinais_vata?: number | null
          status?: string | null
          subsecao?: string | null
          total_sinais?: number | null
          updated_at?: string | null
          user_email?: string | null
        }
        Update: {
          created_at?: string | null
          direcao_check_in?: string | null
          dosha_registro_origem_id?: string | null
          id?: string | null
          momento?: number | null
          pack_perguntas?: Json | null
          perguntas_subsecao?: number | null
          questao_atual?: number | null
          relato_abertura?: string | null
          respostas_raw?: Json | null
          resultado?: Json | null
          seed?: Json | null
          sinais_agni?: number | null
          sinais_ama?: number | null
          sinais_kapha?: number | null
          sinais_pitta?: number | null
          sinais_vata?: number | null
          status?: string | null
          subsecao?: string | null
          total_sinais?: number | null
          updated_at?: string | null
          user_email?: string | null
        }
        Relationships: []
      }
      backup_terapeuta_teste_20261026: {
        Row: {
          cidade: string | null
          codigo: string | null
          "created date": string | null
          email: string | null
          especialidade: string | null
          estado: string | null
          formado_desde: number | null
          frase_card: string | null
          id: string | null
          imagem: string | null
          imagem_card: string | null
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
          codigo?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formado_desde?: number | null
          frase_card?: string | null
          id?: string | null
          imagem?: string | null
          imagem_card?: string | null
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
          codigo?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formado_desde?: number | null
          frase_card?: string | null
          id?: string | null
          imagem?: string | null
          imagem_card?: string | null
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
      backup_terapeutas_especialidade_20261026: {
        Row: {
          especialidade: string | null
          id: string | null
        }
        Insert: {
          especialidade?: string | null
          id?: string | null
        }
        Update: {
          especialidade?: string | null
          id?: string | null
        }
        Relationships: []
      }
      backup_terapia_config_20261026b: {
        Row: {
          atualizado_em: string | null
          chave: string | null
          descricao: string | null
          valor: Json | null
        }
        Insert: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
        }
        Update: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
        }
        Relationships: []
      }
      backup_terapia_config_20261026c: {
        Row: {
          atualizado_em: string | null
          chave: string | null
          descricao: string | null
          valor: Json | null
        }
        Insert: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
        }
        Update: {
          atualizado_em?: string | null
          chave?: string | null
          descricao?: string | null
          valor?: Json | null
        }
        Relationships: []
      }
      backup_terapia_folha_modelos_20261027: {
        Row: {
          dados: Json | null
          id: string | null
          tratamento: string | null
        }
        Insert: {
          dados?: Json | null
          id?: string | null
          tratamento?: string | null
        }
        Update: {
          dados?: Json | null
          id?: string | null
          tratamento?: string | null
        }
        Relationships: []
      }
      backup_terapia_folhas_20261027: {
        Row: {
          dados: Json | null
          diagnostico: string | null
          id: string | null
          tratamento: string | null
        }
        Insert: {
          dados?: Json | null
          diagnostico?: string | null
          id?: string | null
          tratamento?: string | null
        }
        Update: {
          dados?: Json | null
          diagnostico?: string | null
          id?: string | null
          tratamento?: string | null
        }
        Relationships: []
      }
      backup_teste_edsonayurveda_20261026: {
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
          created_at: string | null
          criado_por: string | null
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_path: string | null
          foto_lingua_url: string | null
          id: string | null
          idade: number | null
          idPublico: string | null
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
          tipo: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
          user_id?: string | null
          vatascore?: number | null
        }
        Relationships: []
      }
      backup_teste_portalayurveda_20261026: {
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
          created_at: string | null
          criado_por: string | null
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_path: string | null
          foto_lingua_url: string | null
          id: string | null
          idade: number | null
          idPublico: string | null
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
          tipo: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
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
          created_at?: string | null
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
          foto_lingua_url?: string | null
          id?: string | null
          idade?: number | null
          idPublico?: string | null
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
          tipo?: string | null
          user_id?: string | null
          vatascore?: number | null
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
      bhagavad_gita_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: number
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: number
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: number
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
      bkp_detox_matriculas_20260924: {
        Row: {
          criado_em: string | null
          curso_id: string | null
          expira_em: string | null
          id: string | null
          mp_payment_id: string | null
          origem: string | null
          status: string | null
          stripe_session_id: string | null
          user_id: string | null
          valor_pago: number | null
        }
        Insert: {
          criado_em?: string | null
          curso_id?: string | null
          expira_em?: string | null
          id?: string | null
          mp_payment_id?: string | null
          origem?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
          valor_pago?: number | null
        }
        Update: {
          criado_em?: string | null
          curso_id?: string | null
          expira_em?: string | null
          id?: string | null
          mp_payment_id?: string | null
          origem?: string | null
          status?: string | null
          stripe_session_id?: string | null
          user_id?: string | null
          valor_pago?: number | null
        }
        Relationships: []
      }
      bkp_detox_resgates_20260924: {
        Row: {
          aluno_externo_id: string | null
          codigo: string | null
          criado_em: string | null
          curso_id: string | null
          data_compra_origem: string | null
          email: string | null
          id: string | null
          plataforma_origem: string | null
          tipo: string | null
          turma_origem: string | null
          updated_at: string | null
          usado_em: string | null
          usado_por_user_id: string | null
        }
        Insert: {
          aluno_externo_id?: string | null
          codigo?: string | null
          criado_em?: string | null
          curso_id?: string | null
          data_compra_origem?: string | null
          email?: string | null
          id?: string | null
          plataforma_origem?: string | null
          tipo?: string | null
          turma_origem?: string | null
          updated_at?: string | null
          usado_em?: string | null
          usado_por_user_id?: string | null
        }
        Update: {
          aluno_externo_id?: string | null
          codigo?: string | null
          criado_em?: string | null
          curso_id?: string | null
          data_compra_origem?: string | null
          email?: string | null
          id?: string | null
          plataforma_origem?: string | null
          tipo?: string | null
          turma_origem?: string | null
          updated_at?: string | null
          usado_em?: string | null
          usado_por_user_id?: string | null
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
      brahma_sutras_verses: {
        Row: {
          adhyaya_no: number
          created_at: string | null
          id: number
          pada_no: number
          sankara_commentary_pt: string | null
          sanskrit_text: string | null
          source_note: string | null
          sutra_no: number
          translation_pt: string | null
        }
        Insert: {
          adhyaya_no: number
          created_at?: string | null
          id?: never
          pada_no: number
          sankara_commentary_pt?: string | null
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no: number
          translation_pt?: string | null
        }
        Update: {
          adhyaya_no?: number
          created_at?: string | null
          id?: never
          pada_no?: number
          sankara_commentary_pt?: string | null
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no?: number
          translation_pt?: string | null
        }
        Relationships: []
      }
      brahmanda_purana_verses: {
        Row: {
          book_no: number
          chapter_no: number
          chapter_theme: string | null
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: string
        }
        Insert: {
          book_no: number
          chapter_no: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: string
        }
        Update: {
          book_no?: number
          chapter_no?: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string
        }
        Relationships: []
      }
      brihat_samhita_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          source_note: string | null
          translation_pt: string | null
          verse_no: string | null
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string | null
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string | null
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
      campanha_destinatarios: {
        Row: {
          comunicacao_id: string
          criado_em: string
          email: string
          nome: string | null
        }
        Insert: {
          comunicacao_id: string
          criado_em?: string
          email: string
          nome?: string | null
        }
        Update: {
          comunicacao_id?: string
          criado_em?: string
          email?: string
          nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campanha_destinatarios_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "agenda_comunicacoes"
            referencedColumns: ["id"]
          },
        ]
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
      certificado_avisos: {
        Row: {
          avisado_em: string
          curso_id: string
          user_id: string
        }
        Insert: {
          avisado_em?: string
          curso_id: string
          user_id: string
        }
        Update: {
          avisado_em?: string
          curso_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificado_avisos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      certificado_modelos: {
        Row: {
          atualizado_em: string
          chave: string
          html: string
          html_b64_rascunho: string | null
        }
        Insert: {
          atualizado_em?: string
          chave: string
          html?: string
          html_b64_rascunho?: string | null
        }
        Update: {
          atualizado_em?: string
          chave?: string
          html?: string
          html_b64_rascunho?: string | null
        }
        Relationships: []
      }
      certificados_emitidos: {
        Row: {
          aberturas: number
          curso_id: string
          emitido_em: string
          id: number
          nome_no_diploma: string | null
          registro: string
          ultima_abertura_em: string
          user_id: string
        }
        Insert: {
          aberturas?: number
          curso_id: string
          emitido_em?: string
          id?: number
          nome_no_diploma?: string | null
          registro: string
          ultima_abertura_em?: string
          user_id: string
        }
        Update: {
          aberturas?: number
          curso_id?: string
          emitido_em?: string
          id?: number
          nome_no_diploma?: string | null
          registro?: string
          ultima_abertura_em?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_emitidos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
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
          sthana: string | null
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
          sthana?: string | null
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
          sthana?: string | null
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
      chat_conversas: {
        Row: {
          ausente_enviada_em: string | null
          criado_em: string
          id: string
          paciente_user_id: string
          terapeuta_id: string
          ultima_em: string
        }
        Insert: {
          ausente_enviada_em?: string | null
          criado_em?: string
          id?: string
          paciente_user_id: string
          terapeuta_id: string
          ultima_em?: string
        }
        Update: {
          ausente_enviada_em?: string | null
          criado_em?: string
          id?: string
          paciente_user_id?: string
          terapeuta_id?: string
          ultima_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversas_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
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
      chat_mensagens: {
        Row: {
          autor: string
          conversa_id: string
          criado_em: string
          id: number
          lida_em: string | null
          texto: string
        }
        Insert: {
          autor: string
          conversa_id: string
          criado_em?: string
          id?: never
          lida_em?: string | null
          texto: string
        }
        Update: {
          autor?: string
          conversa_id?: string
          criado_em?: string
          id?: never
          lida_em?: string | null
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "chat_conversas"
            referencedColumns: ["id"]
          },
        ]
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
      classicos_capitulos: {
        Row: {
          amostra: string | null
          ativo: boolean
          created_at: string
          filtro: Json
          fonte_titulo: string | null
          id: number
          n_versos: number
          nivel1: string | null
          nivel1_ordem: number
          nivel2: string | null
          nivel2_ordem: number
          obra_id: number
          resumo: string | null
          revisado: boolean
          rota: string | null
          temas: string[]
          titulo_devanagari: string | null
          titulo_pt: string | null
          titulo_translit: string | null
          updated_at: string
          verso_final: string | null
          verso_inicial: string | null
        }
        Insert: {
          amostra?: string | null
          ativo?: boolean
          created_at?: string
          filtro?: Json
          fonte_titulo?: string | null
          id?: never
          n_versos?: number
          nivel1?: string | null
          nivel1_ordem?: number
          nivel2?: string | null
          nivel2_ordem?: number
          obra_id: number
          resumo?: string | null
          revisado?: boolean
          rota?: string | null
          temas?: string[]
          titulo_devanagari?: string | null
          titulo_pt?: string | null
          titulo_translit?: string | null
          updated_at?: string
          verso_final?: string | null
          verso_inicial?: string | null
        }
        Update: {
          amostra?: string | null
          ativo?: boolean
          created_at?: string
          filtro?: Json
          fonte_titulo?: string | null
          id?: never
          n_versos?: number
          nivel1?: string | null
          nivel1_ordem?: number
          nivel2?: string | null
          nivel2_ordem?: number
          obra_id?: number
          resumo?: string | null
          revisado?: boolean
          rota?: string | null
          temas?: string[]
          titulo_devanagari?: string | null
          titulo_pt?: string | null
          titulo_translit?: string | null
          updated_at?: string
          verso_final?: string | null
          verso_inicial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classicos_capitulos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "classicos_obras"
            referencedColumns: ["id"]
          },
        ]
      }
      classicos_obras: {
        Row: {
          apresentacao: string | null
          ativo: boolean
          autor: string | null
          capa_url: string | null
          col_nivel1: string | null
          col_nivel2: string | null
          col_ordem: string | null
          col_sanscrito: string | null
          col_titulo: string | null
          col_verso: string
          completude: string
          created_at: string
          epoca: string | null
          estante: string
          filtro: Json
          id: number
          nome: string
          nome_devanagari: string | null
          nome_simples: string | null
          nota_estado: string | null
          ordem: number
          rotulo_nivel1: string | null
          rotulo_nivel2: string | null
          slug: string
          tabela: string
          titulo_idioma: string | null
          total_versos: number
          updated_at: string
        }
        Insert: {
          apresentacao?: string | null
          ativo?: boolean
          autor?: string | null
          capa_url?: string | null
          col_nivel1?: string | null
          col_nivel2?: string | null
          col_ordem?: string | null
          col_sanscrito?: string | null
          col_titulo?: string | null
          col_verso?: string
          completude?: string
          created_at?: string
          epoca?: string | null
          estante?: string
          filtro?: Json
          id?: never
          nome: string
          nome_devanagari?: string | null
          nome_simples?: string | null
          nota_estado?: string | null
          ordem?: number
          rotulo_nivel1?: string | null
          rotulo_nivel2?: string | null
          slug: string
          tabela: string
          titulo_idioma?: string | null
          total_versos?: number
          updated_at?: string
        }
        Update: {
          apresentacao?: string | null
          ativo?: boolean
          autor?: string | null
          capa_url?: string | null
          col_nivel1?: string | null
          col_nivel2?: string | null
          col_ordem?: string | null
          col_sanscrito?: string | null
          col_titulo?: string | null
          col_verso?: string
          completude?: string
          created_at?: string
          epoca?: string | null
          estante?: string
          filtro?: Json
          id?: never
          nome?: string
          nome_devanagari?: string | null
          nome_simples?: string | null
          nota_estado?: string | null
          ordem?: number
          rotulo_nivel1?: string | null
          rotulo_nivel2?: string | null
          slug?: string
          tabela?: string
          titulo_idioma?: string | null
          total_versos?: number
          updated_at?: string
        }
        Relationships: []
      }
      classicos_pagina: {
        Row: {
          ativo: boolean
          bloco: string
          chave: string
          icone: string | null
          ordem: number
          rota: string | null
          texto: string | null
          titulo: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bloco: string
          chave: string
          icone?: string | null
          ordem?: number
          rota?: string | null
          texto?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bloco?: string
          chave?: string
          icone?: string | null
          ordem?: number
          rota?: string | null
          texto?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      classicos_planta_versos: {
        Row: {
          entrada: string | null
          obra_id: number
          planta_id: number
          source_id: number
          source_table: string
          verso_no: string | null
        }
        Insert: {
          entrada?: string | null
          obra_id: number
          planta_id: number
          source_id: number
          source_table: string
          verso_no?: string | null
        }
        Update: {
          entrada?: string | null
          obra_id?: number
          planta_id?: number
          source_id?: number
          source_table?: string
          verso_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classicos_planta_versos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "classicos_obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classicos_planta_versos_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "classicos_plantas"
            referencedColumns: ["id"]
          },
        ]
      }
      classicos_plantas: {
        Row: {
          ativo: boolean
          chave: string
          created_at: string
          descricao: string | null
          id: number
          n_obras: number
          n_versos: number
          nome: string
          nome_devanagari: string | null
          nome_latim: string | null
          nome_popular: string | null
          revisado: boolean
          sinonimos: string[]
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          chave: string
          created_at?: string
          descricao?: string | null
          id?: never
          n_obras?: number
          n_versos?: number
          nome: string
          nome_devanagari?: string | null
          nome_latim?: string | null
          nome_popular?: string | null
          revisado?: boolean
          sinonimos?: string[]
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: never
          n_obras?: number
          n_versos?: number
          nome?: string
          nome_devanagari?: string | null
          nome_latim?: string | null
          nome_popular?: string | null
          revisado?: boolean
          sinonimos?: string[]
          updated_at?: string
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
      conhecimento_itens: {
        Row: {
          detalhes: Json | null
          efeito: Json | null
          fonte: Json | null
          fontes: Json | null
          id: string
          nome: string
          nome_busca: string | null
          pertence_a: Json | null
          pt: string | null
          relacoes: Json | null
          sanskrito: string | null
          setor_ficha: string | null
          texto: string | null
          tipo: string
        }
        Insert: {
          detalhes?: Json | null
          efeito?: Json | null
          fonte?: Json | null
          fontes?: Json | null
          id: string
          nome: string
          nome_busca?: string | null
          pertence_a?: Json | null
          pt?: string | null
          relacoes?: Json | null
          sanskrito?: string | null
          setor_ficha?: string | null
          texto?: string | null
          tipo: string
        }
        Update: {
          detalhes?: Json | null
          efeito?: Json | null
          fonte?: Json | null
          fontes?: Json | null
          id?: string
          nome?: string
          nome_busca?: string | null
          pertence_a?: Json | null
          pt?: string | null
          relacoes?: Json | null
          sanskrito?: string | null
          setor_ficha?: string | null
          texto?: string | null
          tipo?: string
        }
        Relationships: []
      }
      consulta_avaliacoes: {
        Row: {
          comentario: string | null
          consulta_id: string
          criado_em: string
          nota: number
          paciente_user_id: string
          publicar: boolean
          terapeuta_id: string
        }
        Insert: {
          comentario?: string | null
          consulta_id: string
          criado_em?: string
          nota: number
          paciente_user_id: string
          publicar?: boolean
          terapeuta_id: string
        }
        Update: {
          comentario?: string | null
          consulta_id?: string
          criado_em?: string
          nota?: number
          paciente_user_id?: string
          publicar?: boolean
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consulta_avaliacoes_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: true
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consulta_avaliacoes_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      consulta_pedidos: {
        Row: {
          consulta_id: string | null
          criado_em: string
          duracao_min: number | null
          em_minutos: number
          expira_em: string
          id: string
          inicio: string | null
          motivo: string | null
          paciente_user_id: string
          respondido_em: string | null
          status: string
          terapeuta_id: string
        }
        Insert: {
          consulta_id?: string | null
          criado_em?: string
          duracao_min?: number | null
          em_minutos?: number
          expira_em?: string
          id?: string
          inicio?: string | null
          motivo?: string | null
          paciente_user_id: string
          respondido_em?: string | null
          status?: string
          terapeuta_id: string
        }
        Update: {
          consulta_id?: string | null
          criado_em?: string
          duracao_min?: number | null
          em_minutos?: number
          expira_em?: string
          id?: string
          inicio?: string | null
          motivo?: string | null
          paciente_user_id?: string
          respondido_em?: string | null
          status?: string
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consulta_pedidos_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consulta_pedidos_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      consultas: {
        Row: {
          cancelada_em: string | null
          criado_em: string
          fim: string
          gravando: boolean
          id: string
          inicio: string
          marcada_por: string
          motivo: string | null
          paciente_user_id: string
          quadro_ao_vivo: string | null
          quadro_ao_vivo_em: string | null
          sala_id: string | null
          status: string
          terapeuta_id: string
        }
        Insert: {
          cancelada_em?: string | null
          criado_em?: string
          fim: string
          gravando?: boolean
          id?: string
          inicio: string
          marcada_por?: string
          motivo?: string | null
          paciente_user_id: string
          quadro_ao_vivo?: string | null
          quadro_ao_vivo_em?: string | null
          sala_id?: string | null
          status?: string
          terapeuta_id: string
        }
        Update: {
          cancelada_em?: string | null
          criado_em?: string
          fim?: string
          gravando?: boolean
          id?: string
          inicio?: string
          marcada_por?: string
          motivo?: string | null
          paciente_user_id?: string
          quadro_ao_vivo?: string | null
          quadro_ao_vivo_em?: string | null
          sala_id?: string | null
          status?: string
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_quadro_ao_vivo_fkey"
            columns: ["quadro_ao_vivo"]
            isOneToOne: false
            referencedRelation: "terapia_quadros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "video_salas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultas_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
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
      curso_aula_posicao: {
        Row: {
          atualizado_em: string
          aula_id: string
          duracao_segundos: number | null
          segundos: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          aula_id: string
          duracao_segundos?: number | null
          segundos?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          aula_id?: string
          duracao_segundos?: number | null
          segundos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "curso_aula_posicao_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_aula_posicao_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "curso_aulas_indice"
            referencedColumns: ["id"]
          },
        ]
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
          html: string | null
          id: string
          imprimir: boolean
          libera_em: string | null
          liberada: boolean
          modulo_id: string
          ordem: number
          slug: string | null
          titulo: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          html?: string | null
          id?: string
          imprimir?: boolean
          libera_em?: string | null
          liberada?: boolean
          modulo_id: string
          ordem?: number
          slug?: string | null
          titulo: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string | null
          duracao_segundos?: number | null
          html?: string | null
          id?: string
          imprimir?: boolean
          libera_em?: string | null
          liberada?: boolean
          modulo_id?: string
          ordem?: number
          slug?: string | null
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
      curso_liberacoes: {
        Row: {
          acao: string
          aplicada_em: string | null
          criado_em: string
          criado_por: string | null
          curso_id: string
          email: string
          email_envio_id: string | null
          expira_antes: string | null
          expira_em: string | null
          id: string
          lote_id: string
          matricula_id: string | null
          obs: string | null
          prazo: Json | null
          status: string
          tipo: string | null
          user_id: string | null
          vitalicio: boolean
        }
        Insert: {
          acao: string
          aplicada_em?: string | null
          criado_em?: string
          criado_por?: string | null
          curso_id: string
          email: string
          email_envio_id?: string | null
          expira_antes?: string | null
          expira_em?: string | null
          id?: string
          lote_id: string
          matricula_id?: string | null
          obs?: string | null
          prazo?: Json | null
          status?: string
          tipo?: string | null
          user_id?: string | null
          vitalicio?: boolean
        }
        Update: {
          acao?: string
          aplicada_em?: string | null
          criado_em?: string
          criado_por?: string | null
          curso_id?: string
          email?: string
          email_envio_id?: string | null
          expira_antes?: string | null
          expira_em?: string | null
          id?: string
          lote_id?: string
          matricula_id?: string | null
          obs?: string | null
          prazo?: Json | null
          status?: string
          tipo?: string | null
          user_id?: string | null
          vitalicio?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "curso_liberacoes_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
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
      curso_pagamentos: {
        Row: {
          aprovado_em: string | null
          atualizado_em: string
          bruto: Json | null
          criado_mp_em: string | null
          curso_id: string | null
          diag: Json | null
          email_informado: string | null
          external_reference: string | null
          liberado_em: string | null
          meio: string | null
          metodo: string | null
          mp_payment_id: string
          pagador_documento: string | null
          pagador_email: string | null
          pagador_nome: string | null
          parcelas: number | null
          ref_user: string | null
          status: string
          status_detalhe: string | null
          taxa_mp: number | null
          titular_cartao: string | null
          user_id: string | null
          valor: number | null
          valor_liquido: number | null
          valor_pago_cliente: number | null
        }
        Insert: {
          aprovado_em?: string | null
          atualizado_em?: string
          bruto?: Json | null
          criado_mp_em?: string | null
          curso_id?: string | null
          diag?: Json | null
          email_informado?: string | null
          external_reference?: string | null
          liberado_em?: string | null
          meio?: string | null
          metodo?: string | null
          mp_payment_id: string
          pagador_documento?: string | null
          pagador_email?: string | null
          pagador_nome?: string | null
          parcelas?: number | null
          ref_user?: string | null
          status: string
          status_detalhe?: string | null
          taxa_mp?: number | null
          titular_cartao?: string | null
          user_id?: string | null
          valor?: number | null
          valor_liquido?: number | null
          valor_pago_cliente?: number | null
        }
        Update: {
          aprovado_em?: string | null
          atualizado_em?: string
          bruto?: Json | null
          criado_mp_em?: string | null
          curso_id?: string | null
          diag?: Json | null
          email_informado?: string | null
          external_reference?: string | null
          liberado_em?: string | null
          meio?: string | null
          metodo?: string | null
          mp_payment_id?: string
          pagador_documento?: string | null
          pagador_email?: string | null
          pagador_nome?: string | null
          parcelas?: number | null
          ref_user?: string | null
          status?: string
          status_detalhe?: string | null
          taxa_mp?: number | null
          titular_cartao?: string | null
          user_id?: string | null
          valor?: number | null
          valor_liquido?: number | null
          valor_pago_cliente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_pagamentos_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      curso_pagamentos_sync: {
        Row: {
          id: number
          ultima_em: string | null
          ultimo_resultado: Json | null
        }
        Insert: {
          id?: number
          ultima_em?: string | null
          ultimo_resultado?: Json | null
        }
        Update: {
          id?: number
          ultima_em?: string | null
          ultimo_resultado?: Json | null
        }
        Relationships: []
      }
      curso_preco_especial: {
        Row: {
          ativo: boolean
          criado_em: string
          curso_id: string
          id: string
          obs: string | null
          parcelas: number | null
          preco: number
          requer_curso_id: string
          valido_ate: string | null
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          curso_id: string
          id?: string
          obs?: string | null
          parcelas?: number | null
          preco: number
          requer_curso_id: string
          valido_ate?: string | null
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          curso_id?: string
          id?: string
          obs?: string | null
          parcelas?: number | null
          preco?: number
          requer_curso_id?: string
          valido_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "curso_preco_especial_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "curso_preco_especial_requer_curso_id_fkey"
            columns: ["requer_curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          acesso_ate: string | null
          acesso_meses: number | null
          ativo: boolean
          aviso_topo: string | null
          banner_html: string | null
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
          acesso_ate?: string | null
          acesso_meses?: number | null
          ativo?: boolean
          aviso_topo?: string | null
          banner_html?: string | null
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
          acesso_ate?: string | null
          acesso_meses?: number | null
          ativo?: boolean
          aviso_topo?: string | null
          banner_html?: string | null
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
      detox_aulas: {
        Row: {
          criado_em: string
          data_aula: string | null
          duracao_seg: number | null
          fases: string[] | null
          no_tutor: boolean
          rotulo: string | null
          tipo: string | null
          titulo: string | null
          video_id: string
          visibilidade: string | null
        }
        Insert: {
          criado_em?: string
          data_aula?: string | null
          duracao_seg?: number | null
          fases?: string[] | null
          no_tutor?: boolean
          rotulo?: string | null
          tipo?: string | null
          titulo?: string | null
          video_id: string
          visibilidade?: string | null
        }
        Update: {
          criado_em?: string
          data_aula?: string | null
          duracao_seg?: number | null
          fases?: string[] | null
          no_tutor?: boolean
          rotulo?: string | null
          tipo?: string | null
          titulo?: string | null
          video_id?: string
          visibilidade?: string | null
        }
        Relationships: []
      }
      detox_calendario: {
        Row: {
          dia: number
          fase: string
          nota: string | null
        }
        Insert: {
          dia: number
          fase: string
          nota?: string | null
        }
        Update: {
          dia?: number
          fase?: string
          nota?: string | null
        }
        Relationships: []
      }
      detox_legendas_extra: {
        Row: {
          criado_em: string
          fonte: string | null
          legenda: string
          video_id: string
        }
        Insert: {
          criado_em?: string
          fonte?: string | null
          legenda: string
          video_id: string
        }
        Update: {
          criado_em?: string
          fonte?: string | null
          legenda?: string
          video_id?: string
        }
        Relationships: []
      }
      detox_pont_blocos: {
        Row: {
          atualizado_em: string
          bloco: number
          erro: string | null
          id: number
          nivel: number
          ordem: number | null
          req_id: number | null
          seg_ini: number[]
          seg_palavras: number[]
          segs_pont: string[] | null
          status: string
          tentativas: number
          texto_orig: string
          texto_pont: string | null
          video_id: string
        }
        Insert: {
          atualizado_em?: string
          bloco: number
          erro?: string | null
          id?: number
          nivel?: number
          ordem?: number | null
          req_id?: number | null
          seg_ini: number[]
          seg_palavras: number[]
          segs_pont?: string[] | null
          status?: string
          tentativas?: number
          texto_orig: string
          texto_pont?: string | null
          video_id: string
        }
        Update: {
          atualizado_em?: string
          bloco?: number
          erro?: string | null
          id?: number
          nivel?: number
          ordem?: number | null
          req_id?: number | null
          seg_ini?: number[]
          seg_palavras?: number[]
          segs_pont?: string[] | null
          status?: string
          tentativas?: number
          texto_orig?: string
          texto_pont?: string | null
          video_id?: string
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
          obra_real: string
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
          obra_real: string
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
          obra_real?: string
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
      documents_detox_arquivo_2409: {
        Row: {
          chars: number | null
          content: string | null
          content_antes: string | null
          criado_em: string | null
          cursos: string[] | null
          embedding: string | null
          id: number | null
          minuto: number | null
          pedaco: number | null
          segundo: number | null
          titulo: string | null
          total_pedacos: number | null
          url_youtube: string | null
          video_id: string | null
        }
        Insert: {
          chars?: number | null
          content?: string | null
          content_antes?: string | null
          criado_em?: string | null
          cursos?: string[] | null
          embedding?: string | null
          id?: number | null
          minuto?: number | null
          pedaco?: number | null
          segundo?: number | null
          titulo?: string | null
          total_pedacos?: number | null
          url_youtube?: string | null
          video_id?: string | null
        }
        Update: {
          chars?: number | null
          content?: string | null
          content_antes?: string | null
          criado_em?: string | null
          cursos?: string[] | null
          embedding?: string | null
          id?: number | null
          minuto?: number | null
          pedaco?: number | null
          segundo?: number | null
          titulo?: string | null
          total_pedacos?: number | null
          url_youtube?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      documents_detox_rascunho: {
        Row: {
          ano: number | null
          chars: number | null
          content: string
          content_antes: string | null
          criado_em: string
          cursos: string[]
          doshas: string[] | null
          embedding: string | null
          fases: string[] | null
          fonte: string
          id: number
          minuto: number | null
          pedaco: number | null
          rotulo: string | null
          segundo: number | null
          titulo: string | null
          total_pedacos: number | null
          url_youtube: string | null
          video_id: string
        }
        Insert: {
          ano?: number | null
          chars?: number | null
          content: string
          content_antes?: string | null
          criado_em?: string
          cursos?: string[]
          doshas?: string[] | null
          embedding?: string | null
          fases?: string[] | null
          fonte?: string
          id?: number
          minuto?: number | null
          pedaco?: number | null
          rotulo?: string | null
          segundo?: number | null
          titulo?: string | null
          total_pedacos?: number | null
          url_youtube?: string | null
          video_id: string
        }
        Update: {
          ano?: number | null
          chars?: number | null
          content?: string
          content_antes?: string | null
          criado_em?: string
          cursos?: string[]
          doshas?: string[] | null
          embedding?: string | null
          fases?: string[] | null
          fonte?: string
          id?: number
          minuto?: number | null
          pedaco?: number | null
          rotulo?: string | null
          segundo?: number | null
          titulo?: string | null
          total_pedacos?: number | null
          url_youtube?: string | null
          video_id?: string
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
          criado_por: string | null
          cupom_id: string | null
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          estado: string | null
          foto_lingua_path: string | null
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
          respostas: Json | null
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
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
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
          respostas?: Json | null
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
          criado_por?: string | null
          cupom_id?: string | null
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          estado?: string | null
          foto_lingua_path?: string | null
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
          respostas?: Json | null
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
      email_eventos_quarentena: {
        Row: {
          id: number
          ip: string | null
          payload: Json
          recebido_em: string
          reprocessado_em: string | null
        }
        Insert: {
          id?: number
          ip?: string | null
          payload: Json
          recebido_em?: string
          reprocessado_em?: string | null
        }
        Update: {
          id?: number
          ip?: string | null
          payload?: Json
          recebido_em?: string
          reprocessado_em?: string | null
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
      escola_aula_progresso: {
        Row: {
          atualizado_em: string
          concluida_em: string | null
          duracao_segundos: number | null
          recurso_id: string
          segundos: number
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          concluida_em?: string | null
          duracao_segundos?: number | null
          recurso_id: string
          segundos?: number
          user_id: string
        }
        Update: {
          atualizado_em?: string
          concluida_em?: string | null
          duracao_segundos?: number | null
          recurso_id?: string
          segundos?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escola_aula_progresso_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "escola_modulo_recursos"
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
      foto_pedidos: {
        Row: {
          ate: string | null
          atendido_em: string | null
          criado_em: string
          foto_id: string | null
          id: string
          instrucao: string | null
          modelo: string | null
          paciente_user_id: string
          status: string
          terapeuta_id: string
          titulo: string
        }
        Insert: {
          ate?: string | null
          atendido_em?: string | null
          criado_em?: string
          foto_id?: string | null
          id?: string
          instrucao?: string | null
          modelo?: string | null
          paciente_user_id: string
          status?: string
          terapeuta_id: string
          titulo: string
        }
        Update: {
          ate?: string | null
          atendido_em?: string | null
          criado_em?: string
          foto_id?: string | null
          id?: string
          instrucao?: string | null
          modelo?: string | null
          paciente_user_id?: string
          status?: string
          terapeuta_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "foto_pedidos_foto_id_fkey"
            columns: ["foto_id"]
            isOneToOne: false
            referencedRelation: "paciente_fotos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foto_pedidos_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
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
      garuda_purana_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          source_note: string | null
          translation_pt: string | null
          verse_no: string | null
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string | null
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string | null
        }
        Relationships: []
      }
      gheranda_samhita_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: number
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: number
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: number
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
      hatha_yoga_pradipika_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: number
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: number
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: number
        }
        Relationships: []
      }
      horario_reservas: {
        Row: {
          expira_em: string
          inicio: string
          terapeuta_id: string
          user_id: string
        }
        Insert: {
          expira_em: string
          inicio: string
          terapeuta_id: string
          user_id: string
        }
        Update: {
          expira_em?: string
          inicio?: string
          terapeuta_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "horario_reservas_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacao_feitos: {
        Row: {
          criado_em: string
          dia: string
          folha_id: string
          item: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          dia: string
          folha_id: string
          item: string
          user_id: string
        }
        Update: {
          criado_em?: string
          dia?: string
          folha_id?: string
          item?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicacao_feitos_folha_id_fkey"
            columns: ["folha_id"]
            isOneToOne: false
            referencedRelation: "terapia_folhas"
            referencedColumns: ["id"]
          },
        ]
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
      jornada_ficha: {
        Row: {
          created_at: string
          dosha_id_publico: string | null
          email: string | null
          id: string
          jornada_slug: string
          noite: number
          respostas: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosha_id_publico?: string | null
          email?: string | null
          id?: string
          jornada_slug?: string
          noite?: number
          respostas?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosha_id_publico?: string | null
          email?: string | null
          id?: string
          jornada_slug?: string
          noite?: number
          respostas?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jornada_sintese: {
        Row: {
          classificacao: string
          dados: Json
          fichas_em: string | null
          gerado_em: string
          jornada_slug: string
          texto: string
          user_id: string
        }
        Insert: {
          classificacao: string
          dados?: Json
          fichas_em?: string | null
          gerado_em?: string
          jornada_slug?: string
          texto: string
          user_id: string
        }
        Update: {
          classificacao?: string
          dados?: Json
          fichas_em?: string | null
          gerado_em?: string
          jornada_slug?: string
          texto?: string
          user_id?: string
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
          sthana: string | null
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
          sthana?: string | null
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
          sthana?: string | null
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
      kularnava_tantra_verses: {
        Row: {
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          ullasa_name: string | null
          ullasa_no: number
          verse_no: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          ullasa_name?: string | null
          ullasa_no: number
          verse_no: number
        }
        Update: {
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          ullasa_name?: string | null
          ullasa_no?: number
          verse_no?: number
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
      lingua_leituras: {
        Row: {
          created_at: string
          foto_path: string | null
          id: string
          marco_n: number
          programa_slug: string
          respostas: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          foto_path?: string | null
          id?: string
          marco_n: number
          programa_slug: string
          respostas?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          foto_path?: string | null
          id?: string
          marco_n?: number
          programa_slug?: string
          respostas?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lingua_leituras_programa_slug_fkey"
            columns: ["programa_slug"]
            isOneToOne: false
            referencedRelation: "lingua_programas"
            referencedColumns: ["slug"]
          },
        ]
      }
      lingua_marcos: {
        Row: {
          abre_em: string
          fecha_em: string
          n: number
          programa_slug: string
          texto: string | null
          titulo: string
        }
        Insert: {
          abre_em: string
          fecha_em: string
          n: number
          programa_slug: string
          texto?: string | null
          titulo: string
        }
        Update: {
          abre_em?: string
          fecha_em?: string
          n?: number
          programa_slug?: string
          texto?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lingua_marcos_programa_slug_fkey"
            columns: ["programa_slug"]
            isOneToOne: false
            referencedRelation: "lingua_programas"
            referencedColumns: ["slug"]
          },
        ]
      }
      lingua_programas: {
        Row: {
          ativo: boolean
          chamada: string | null
          created_at: string
          curso_id: string | null
          descricao: string | null
          dica: string | null
          slug: string
          titulo: string
          titulo_tela: string | null
        }
        Insert: {
          ativo?: boolean
          chamada?: string | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          dica?: string | null
          slug: string
          titulo: string
          titulo_tela?: string | null
        }
        Update: {
          ativo?: boolean
          chamada?: string | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          dica?: string | null
          slug?: string
          titulo?: string
          titulo_tela?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lingua_programas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
          chapter_name_norm: string | null
          citation_key: string
          continues_from_prev: boolean | null
          continues_to_next: boolean | null
          created_at: string | null
          editorial_footnote: string | null
          embedding: string | null
          has_lacuna: boolean
          id: number
          lacuna_note: string | null
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
          chapter_name_norm?: string | null
          citation_key: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          has_lacuna?: boolean
          id?: never
          lacuna_note?: string | null
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
          chapter_name_norm?: string | null
          citation_key?: string
          continues_from_prev?: boolean | null
          continues_to_next?: boolean | null
          created_at?: string | null
          editorial_footnote?: string | null
          embedding?: string | null
          has_lacuna?: boolean
          id?: never
          lacuna_note?: string | null
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
      mahanirvana_tantra_verses: {
        Row: {
          chapter_name: string | null
          chapter_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: number
        }
        Insert: {
          chapter_name?: string | null
          chapter_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: number
        }
        Update: {
          chapter_name?: string | null
          chapter_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: number
        }
        Relationships: []
      }
      matsya_purana_verses: {
        Row: {
          chapter_no: number
          chapter_theme: string | null
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: string
        }
        Insert: {
          chapter_no: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: string
        }
        Update: {
          chapter_no?: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          assunto: string
          canal: string
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
          thread_message_id: string | null
          tipo: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assunto: string
          canal?: string
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
          thread_message_id?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assunto?: string
          canal?: string
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
          thread_message_id?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      mensagens_itens: {
        Row: {
          anexos: Json
          corpo_html: string | null
          corpo_texto: string | null
          criado_em: string
          destinatario_email: string | null
          direcao: string
          id: string
          in_reply_to: string | null
          mensagem_id: string
          message_id: string | null
          remetente_email: string | null
          remetente_nome: string | null
          status: string
        }
        Insert: {
          anexos?: Json
          corpo_html?: string | null
          corpo_texto?: string | null
          criado_em?: string
          destinatario_email?: string | null
          direcao: string
          id?: string
          in_reply_to?: string | null
          mensagem_id: string
          message_id?: string | null
          remetente_email?: string | null
          remetente_nome?: string | null
          status?: string
        }
        Update: {
          anexos?: Json
          corpo_html?: string | null
          corpo_texto?: string | null
          criado_em?: string
          destinatario_email?: string | null
          direcao?: string
          id?: string
          in_reply_to?: string | null
          mensagem_id?: string
          message_id?: string | null
          remetente_email?: string | null
          remetente_nome?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_itens_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens"
            referencedColumns: ["id"]
          },
        ]
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
      meu_dosha_grafico_config: {
        Row: {
          atualizado_em: string
          cfg: Json
          id: number
        }
        Insert: {
          atualizado_em?: string
          cfg: Json
          id?: number
        }
        Update: {
          atualizado_em?: string
          cfg?: Json
          id?: number
        }
        Relationships: []
      }
      meu_dosha_plantas: {
        Row: {
          chave: string
          dosha: string
          ordem: number
        }
        Insert: {
          chave: string
          dosha: string
          ordem?: number
        }
        Update: {
          chave?: string
          dosha?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "meu_dosha_plantas_chave_fkey"
            columns: ["chave"]
            isOneToOne: false
            referencedRelation: "classicos_plantas"
            referencedColumns: ["chave"]
          },
        ]
      }
      mimamsa_sutras_verses: {
        Row: {
          adhyaya_no: number
          created_at: string | null
          id: number
          pada_no: number
          sanskrit_text: string | null
          source_note: string | null
          sutra_no: number
          translation_pt: string | null
        }
        Insert: {
          adhyaya_no: number
          created_at?: string | null
          id?: never
          pada_no: number
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no: number
          translation_pt?: string | null
        }
        Update: {
          adhyaya_no?: number
          created_at?: string | null
          id?: never
          pada_no?: number
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no?: number
          translation_pt?: string | null
        }
        Relationships: []
      }
      mockups_personalizados: {
        Row: {
          ativo: boolean
          bullets: Json
          cor_hex: string
          created_at: string
          cta_texto: string
          descricao: string | null
          id: string
          imagem_url: string | null
          link_destino: string
          mostrar_play: boolean
          ordem: number
          preco: string | null
          preco_nota: string | null
          preco_riscado: string | null
          preco_sufixo: string | null
          prova_social: string | null
          selo: string
          tags: string | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          bullets?: Json
          cor_hex?: string
          created_at?: string
          cta_texto?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link_destino?: string
          mostrar_play?: boolean
          ordem?: number
          preco?: string | null
          preco_nota?: string | null
          preco_riscado?: string | null
          preco_sufixo?: string | null
          prova_social?: string | null
          selo?: string
          tags?: string | null
          tipo: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          bullets?: Json
          cor_hex?: string
          created_at?: string
          cta_texto?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link_destino?: string
          mostrar_play?: boolean
          ordem?: number
          preco?: string | null
          preco_nota?: string | null
          preco_riscado?: string | null
          preco_sufixo?: string | null
          prova_social?: string | null
          selo?: string
          tags?: string | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      municipios: {
        Row: {
          capital: boolean
          codigo_ibge: number
          fuso: string
          latitude: number
          longitude: number
          nome: string
          nome_busca: string
          uf: string
        }
        Insert: {
          capital?: boolean
          codigo_ibge: number
          fuso: string
          latitude: number
          longitude: number
          nome: string
          nome_busca: string
          uf: string
        }
        Update: {
          capital?: boolean
          codigo_ibge?: number
          fuso?: string
          latitude?: number
          longitude?: number
          nome?: string
          nome_busca?: string
          uf?: string
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
      nyaya_sutras_verses: {
        Row: {
          adhyaya_no: number
          ahnika_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          sutra_no: number
          translation_pt: string | null
        }
        Insert: {
          adhyaya_no: number
          ahnika_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no: number
          translation_pt?: string | null
        }
        Update: {
          adhyaya_no?: number
          ahnika_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no?: number
          translation_pt?: string | null
        }
        Relationships: []
      }
      osho_tarot_cartas: {
        Row: {
          comentario: string | null
          created_at: string
          foto_path: string | null
          id: number
          nome: string
          numero: number
          texto_carta: string
        }
        Insert: {
          comentario?: string | null
          created_at?: string
          foto_path?: string | null
          id?: never
          nome: string
          numero: number
          texto_carta: string
        }
        Update: {
          comentario?: string | null
          created_at?: string
          foto_path?: string | null
          id?: never
          nome?: string
          numero?: number
          texto_carta?: string
        }
        Relationships: []
      }
      paciente_fotos: {
        Row: {
          criado_em: string
          enviada_por: string | null
          id: string
          path: string
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          criado_em?: string
          enviada_por?: string | null
          id?: string
          path: string
          tipo: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          criado_em?: string
          enviada_por?: string | null
          id?: string
          path?: string
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      paginas_venda: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          css: string
          descricao: string | null
          encerrada_html: string | null
          html: string
          imagem_url: string | null
          preco_especial_id: string
          slug: string
          texto_botao: string
          texto_email: string
          titulo: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          css?: string
          descricao?: string | null
          encerrada_html?: string | null
          html?: string
          imagem_url?: string | null
          preco_especial_id: string
          slug: string
          texto_botao?: string
          texto_email?: string
          titulo: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          css?: string
          descricao?: string | null
          encerrada_html?: string | null
          html?: string
          imagem_url?: string | null
          preco_especial_id?: string
          slug?: string
          texto_botao?: string
          texto_email?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "paginas_venda_preco_especial_id_fkey"
            columns: ["preco_especial_id"]
            isOneToOne: false
            referencedRelation: "curso_preco_especial"
            referencedColumns: ["id"]
          },
        ]
      }
      paginas_venda_acessos: {
        Row: {
          criado_em: string
          email: string | null
          id: number
          resultado: string
          slug: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          email?: string | null
          id?: never
          resultado: string
          slug: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          email?: string | null
          id?: never
          resultado?: string
          slug?: string
          user_id?: string | null
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
      pessoa_nascimento: {
        Row: {
          atualizado_em: string
          atualizado_por: string | null
          data: string | null
          hora: string | null
          hora_conhecida: boolean
          local_exterior: string | null
          municipio_ibge: number | null
          user_id: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          data?: string | null
          hora?: string | null
          hora_conhecida?: boolean
          local_exterior?: string | null
          municipio_ibge?: number | null
          user_id: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          data?: string | null
          hora?: string | null
          hora_conhecida?: boolean
          local_exterior?: string | null
          municipio_ibge?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pessoa_nascimento_municipio_ibge_fkey"
            columns: ["municipio_ibge"]
            isOneToOne: false
            referencedRelation: "municipios"
            referencedColumns: ["codigo_ibge"]
          },
        ]
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
      pontos_atencao_regras: {
        Row: {
          anda_junto: string | null
          ativo: boolean
          minimo: number
          nome: string
          ordem: number
          queixas: string[]
          slug: string
        }
        Insert: {
          anda_junto?: string | null
          ativo?: boolean
          minimo: number
          nome: string
          ordem?: number
          queixas: string[]
          slug: string
        }
        Update: {
          anda_junto?: string | null
          ativo?: boolean
          minimo?: number
          nome?: string
          ordem?: number
          queixas?: string[]
          slug?: string
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
          publicar_em: string | null
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
          publicar_em?: string | null
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
          publicar_em?: string | null
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
      portal_manual: {
        Row: {
          atualizado_em: string
          categoria: string
          criado_em: string
          cuidados: string | null
          id: string
          modulos_devlog: string[] | null
          o_que_e: string | null
          ordem: number | null
          passo_a_passo: string | null
          rota_admin: string | null
          status: string
          tabelas_relacionadas: string[] | null
          titulo: string
          ultima_verificacao: string | null
        }
        Insert: {
          atualizado_em?: string
          categoria: string
          criado_em?: string
          cuidados?: string | null
          id?: string
          modulos_devlog?: string[] | null
          o_que_e?: string | null
          ordem?: number | null
          passo_a_passo?: string | null
          rota_admin?: string | null
          status?: string
          tabelas_relacionadas?: string[] | null
          titulo: string
          ultima_verificacao?: string | null
        }
        Update: {
          atualizado_em?: string
          categoria?: string
          criado_em?: string
          cuidados?: string | null
          id?: string
          modulos_devlog?: string[] | null
          o_que_e?: string | null
          ordem?: number | null
          passo_a_passo?: string | null
          rota_admin?: string | null
          status?: string
          tabelas_relacionadas?: string[] | null
          titulo?: string
          ultima_verificacao?: string | null
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
          atendimento: string[] | null
          cidade: string | null
          codigo: string | null
          "created date": string | null
          email: string | null
          especialidade: string | null
          estado: string | null
          formacao: string | null
          formado_desde: number | null
          frase_card: string | null
          id: string
          imagem: string | null
          imagem_card: string | null
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
          atendimento?: string[] | null
          cidade?: string | null
          codigo?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formacao?: string | null
          formado_desde?: number | null
          frase_card?: string | null
          id?: string
          imagem?: string | null
          imagem_card?: string | null
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
          atendimento?: string[] | null
          cidade?: string | null
          codigo?: string | null
          "created date"?: string | null
          email?: string | null
          especialidade?: string | null
          estado?: string | null
          formacao?: string | null
          formado_desde?: number | null
          frase_card?: string | null
          id?: string
          imagem?: string | null
          imagem_card?: string | null
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
      premium_por_curso: {
        Row: {
          ate: string
          concedido_em: string
          curso_id: string
          encerrado_em: string | null
          id: number
          ja_era_premium: boolean
          user_id: string
        }
        Insert: {
          ate: string
          concedido_em?: string
          curso_id: string
          encerrado_em?: string | null
          id?: number
          ja_era_premium?: boolean
          user_id: string
        }
        Update: {
          ate?: string
          concedido_em?: string
          curso_id?: string
          encerrado_em?: string | null
          id?: number
          ja_era_premium?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_por_curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
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
      prontuario_notas: {
        Row: {
          consulta_id: string | null
          criado_em: string
          id: string
          paciente_user_id: string
          terapeuta_id: string
          texto: string
        }
        Insert: {
          consulta_id?: string | null
          criado_em?: string
          id?: string
          paciente_user_id: string
          terapeuta_id: string
          texto: string
        }
        Update: {
          consulta_id?: string | null
          criado_em?: string
          id?: string
          paciente_user_id?: string
          terapeuta_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "prontuario_notas_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      rasaratna_samuccaya_verses: {
        Row: {
          adhyaya_name: string | null
          adhyaya_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: string
        }
        Insert: {
          adhyaya_name?: string | null
          adhyaya_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: string
        }
        Update: {
          adhyaya_name?: string | null
          adhyaya_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string
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
      redirecionamentos: {
        Row: {
          ativo: boolean
          created_at: string
          de_path: string
          id: string
          nota: string | null
          para_path: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          de_path: string
          id?: string
          nota?: string | null
          para_path: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          de_path?: string
          id?: string
          nota?: string | null
          para_path?: string
          updated_at?: string
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
          sinais_ama: number | null
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
          sinais_ama?: number | null
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
          sinais_ama?: number | null
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
      secao_eventos: {
        Row: {
          criado_em: string
          dia: string
          estado: string | null
          evento: string
          slug: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          dia?: string
          estado?: string | null
          evento: string
          slug: string
          user_id: string
        }
        Update: {
          criado_em?: string
          dia?: string
          estado?: string | null
          evento?: string
          slug?: string
          user_id?: string
        }
        Relationships: []
      }
      secoes: {
        Row: {
          amostra: number
          ativo: boolean
          atualizado_em: string
          criado_em: string
          funcao: string | null
          html: string | null
          icone: string | null
          lancado_em: string | null
          nivel: string
          pilha_cadeado: string | null
          pilha_link: string | null
          pilha_link_texto: string | null
          pilha_texto: string | null
          slug: string
          textos: Json
          tipo: string
          titulo: string | null
          titulo_admin: string
        }
        Insert: {
          amostra?: number
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          funcao?: string | null
          html?: string | null
          icone?: string | null
          lancado_em?: string | null
          nivel?: string
          pilha_cadeado?: string | null
          pilha_link?: string | null
          pilha_link_texto?: string | null
          pilha_texto?: string | null
          slug: string
          textos?: Json
          tipo?: string
          titulo?: string | null
          titulo_admin: string
        }
        Update: {
          amostra?: number
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          funcao?: string | null
          html?: string | null
          icone?: string | null
          lancado_em?: string | null
          nivel?: string
          pilha_cadeado?: string | null
          pilha_link?: string | null
          pilha_link_texto?: string | null
          pilha_texto?: string | null
          slug?: string
          textos?: Json
          tipo?: string
          titulo?: string | null
          titulo_admin?: string
        }
        Relationships: []
      }
      secoes_lugares: {
        Row: {
          ativo: boolean
          criado_em: string
          id: string
          ordem: number
          publico: string | null
          secao_slug: string
          slot: string
        }
        Insert: {
          ativo?: boolean
          criado_em?: string
          id?: string
          ordem?: number
          publico?: string | null
          secao_slug: string
          slot: string
        }
        Update: {
          ativo?: boolean
          criado_em?: string
          id?: string
          ordem?: number
          publico?: string | null
          secao_slug?: string
          slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "secoes_lugares_secao_slug_fkey"
            columns: ["secao_slug"]
            isOneToOne: false
            referencedRelation: "secoes"
            referencedColumns: ["slug"]
          },
        ]
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
      seu_hoje_config: {
        Row: {
          id: number
          titulo: string
          updated_at: string | null
        }
        Insert: {
          id?: number
          titulo?: string
          updated_at?: string | null
        }
        Update: {
          id?: number
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seu_hoje_modulos: {
        Row: {
          ativo: boolean
          chave: string
          created_at: string | null
          href: string | null
          html: string | null
          id: string
          imagem: string | null
          ordem: number
          resumo: string | null
          rotulo: string | null
          tags: string[]
          titulo: string | null
        }
        Insert: {
          ativo?: boolean
          chave: string
          created_at?: string | null
          href?: string | null
          html?: string | null
          id?: string
          imagem?: string | null
          ordem?: number
          resumo?: string | null
          rotulo?: string | null
          tags?: string[]
          titulo?: string | null
        }
        Update: {
          ativo?: boolean
          chave?: string
          created_at?: string | null
          href?: string | null
          html?: string | null
          id?: string
          imagem?: string | null
          ordem?: number
          resumo?: string | null
          rotulo?: string | null
          tags?: string[]
          titulo?: string | null
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
          has_lacuna: boolean
          id: number
          khanda_name: string | null
          lacuna_note: string | null
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
          has_lacuna?: boolean
          id?: never
          khanda_name?: string | null
          lacuna_note?: string | null
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
          has_lacuna?: boolean
          id?: never
          khanda_name?: string | null
          lacuna_note?: string | null
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
      study_collections: {
        Row: {
          created_at: string
          description: string | null
          evaluation: Json | null
          id: number
          institution: string | null
          institution_country: string | null
          is_published: boolean
          level: string | null
          methodology: Json | null
          order_index: number
          pitfalls: Json | null
          program_group: string | null
          program_group_order: number | null
          slug: string
          source_note: string | null
          source_url: string | null
          title: string
          type: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          evaluation?: Json | null
          id?: never
          institution?: string | null
          institution_country?: string | null
          is_published?: boolean
          level?: string | null
          methodology?: Json | null
          order_index?: number
          pitfalls?: Json | null
          program_group?: string | null
          program_group_order?: number | null
          slug: string
          source_note?: string | null
          source_url?: string | null
          title: string
          type: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          evaluation?: Json | null
          id?: never
          institution?: string | null
          institution_country?: string | null
          is_published?: boolean
          level?: string | null
          methodology?: Json | null
          order_index?: number
          pitfalls?: Json | null
          program_group?: string | null
          program_group_order?: number | null
          slug?: string
          source_note?: string | null
          source_url?: string | null
          title?: string
          type?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      study_items: {
        Row: {
          collection_id: number
          created_at: string
          curator_note: string | null
          id: number
          is_featured: boolean
          module_id: number | null
          order_index: number
          source_id: number
          source_table: string
        }
        Insert: {
          collection_id: number
          created_at?: string
          curator_note?: string | null
          id?: never
          is_featured?: boolean
          module_id?: number | null
          order_index?: number
          source_id: number
          source_table: string
        }
        Update: {
          collection_id?: number
          created_at?: string
          curator_note?: string | null
          id?: never
          is_featured?: boolean
          module_id?: number | null
          order_index?: number
          source_id?: number
          source_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "study_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      study_modules: {
        Row: {
          collection_id: number
          created_at: string
          description: string | null
          id: number
          order_index: number
          rationale: string | null
          title: string
        }
        Insert: {
          collection_id: number
          created_at?: string
          description?: string | null
          id?: never
          order_index: number
          rationale?: string | null
          title: string
        }
        Update: {
          collection_id?: number
          created_at?: string
          description?: string | null
          id?: never
          order_index?: number
          rationale?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_modules_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "study_collections"
            referencedColumns: ["id"]
          },
        ]
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
          editorial_footnote_skt?: string | null
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
          sthana?: string | null
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
      terapeuta_acervo: {
        Row: {
          arquivo_path: string | null
          atualizado_em: string
          conteudo: Json
          criado_em: string
          id: string
          kapha: number
          periodo: string | null
          pitta: number
          resumo: string | null
          revisao: string
          serve_para: string[]
          slug: string
          subcategoria: string | null
          tags: string[]
          terapeuta_id: string
          tipo: string
          titulo: string
          vata: number
          visibilidade: string
        }
        Insert: {
          arquivo_path?: string | null
          atualizado_em?: string
          conteudo?: Json
          criado_em?: string
          id?: string
          kapha?: number
          periodo?: string | null
          pitta?: number
          resumo?: string | null
          revisao?: string
          serve_para?: string[]
          slug: string
          subcategoria?: string | null
          tags?: string[]
          terapeuta_id: string
          tipo: string
          titulo: string
          vata?: number
          visibilidade?: string
        }
        Update: {
          arquivo_path?: string | null
          atualizado_em?: string
          conteudo?: Json
          criado_em?: string
          id?: string
          kapha?: number
          periodo?: string | null
          pitta?: number
          resumo?: string | null
          revisao?: string
          serve_para?: string[]
          slug?: string
          subcategoria?: string | null
          tags?: string[]
          terapeuta_id?: string
          tipo?: string
          titulo?: string
          vata?: number
          visibilidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_acervo_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_agenda: {
        Row: {
          dia_semana: number
          duracao_min: number
          fim: string
          id: string
          inicio: string
          intervalo_min: number
          terapeuta_id: string
        }
        Insert: {
          dia_semana: number
          duracao_min?: number
          fim: string
          id?: string
          inicio: string
          intervalo_min?: number
          terapeuta_id: string
        }
        Update: {
          dia_semana?: number
          duracao_min?: number
          fim?: string
          id?: string
          inicio?: string
          intervalo_min?: number
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_agenda_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_biblioteca: {
        Row: {
          atualizado_em: string
          dados: Json
          terapeuta_id: string
        }
        Insert: {
          atualizado_em?: string
          dados?: Json
          terapeuta_id: string
        }
        Update: {
          atualizado_em?: string
          dados?: Json
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_biblioteca_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: true
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_bloqueios: {
        Row: {
          criado_em: string
          dia: string
          id: string
          motivo: string | null
          terapeuta_id: string
        }
        Insert: {
          criado_em?: string
          dia: string
          id?: string
          motivo?: string | null
          terapeuta_id: string
        }
        Update: {
          criado_em?: string
          dia?: string
          id?: string
          motivo?: string | null
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_bloqueios_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_favoritos: {
        Row: {
          criado_em: string
          item: Json
          ref: string
          terapeuta_id: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          item?: Json
          ref: string
          terapeuta_id: string
          tipo: string
        }
        Update: {
          criado_em?: string
          item?: Json
          ref?: string
          terapeuta_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_favoritos_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_horarios_extra: {
        Row: {
          criado_em: string
          fim: string
          id: string
          inicio: string
          terapeuta_id: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          fim: string
          id?: string
          inicio: string
          terapeuta_id: string
          tipo: string
        }
        Update: {
          criado_em?: string
          fim?: string
          id?: string
          inicio?: string
          terapeuta_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_horarios_extra_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_pacientes: {
        Row: {
          criado_em: string
          encerrado_em: string | null
          id: string
          origem: string
          paciente_user_id: string
          perm_akasha: boolean
          perm_fotos: boolean
          perm_rotina: boolean
          perm_teste: boolean
          status: string
          terapeuta_id: string
        }
        Insert: {
          criado_em?: string
          encerrado_em?: string | null
          id?: string
          origem?: string
          paciente_user_id: string
          perm_akasha?: boolean
          perm_fotos?: boolean
          perm_rotina?: boolean
          perm_teste?: boolean
          status?: string
          terapeuta_id: string
        }
        Update: {
          criado_em?: string
          encerrado_em?: string | null
          id?: string
          origem?: string
          paciente_user_id?: string
          perm_akasha?: boolean
          perm_fotos?: boolean
          perm_rotina?: boolean
          perm_teste?: boolean
          status?: string
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_pacientes_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapeuta_sistema: {
        Row: {
          antecedencia_horas: number
          atualizado_em: string
          boas_vindas: string | null
          msg_ausente: string | null
          no_sistema: boolean
          online: boolean
          online_desde: string | null
          pedir_nascimento: boolean
          terapeuta_id: string
          termo_aceito_em: string | null
          termo_versao: string | null
          valor_consulta: number | null
          visto_em: string | null
        }
        Insert: {
          antecedencia_horas?: number
          atualizado_em?: string
          boas_vindas?: string | null
          msg_ausente?: string | null
          no_sistema?: boolean
          online?: boolean
          online_desde?: string | null
          pedir_nascimento?: boolean
          terapeuta_id: string
          termo_aceito_em?: string | null
          termo_versao?: string | null
          valor_consulta?: number | null
          visto_em?: string | null
        }
        Update: {
          antecedencia_horas?: number
          atualizado_em?: string
          boas_vindas?: string | null
          msg_ausente?: string | null
          no_sistema?: boolean
          online?: boolean
          online_desde?: string | null
          pedir_nascimento?: boolean
          terapeuta_id?: string
          termo_aceito_em?: string | null
          termo_versao?: string | null
          valor_consulta?: number | null
          visto_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terapeuta_sistema_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: true
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapia_avaliacoes: {
        Row: {
          atualizado_em: string
          consulta_id: string | null
          criado_em: string
          dados: Json
          id: string
          leitura: Json | null
          mostrada_em: string | null
          mostrar_pessoa: boolean
          paciente_user_id: string
          resumo: string | null
          terapeuta_id: string
        }
        Insert: {
          atualizado_em?: string
          consulta_id?: string | null
          criado_em?: string
          dados?: Json
          id?: string
          leitura?: Json | null
          mostrada_em?: string | null
          mostrar_pessoa?: boolean
          paciente_user_id: string
          resumo?: string | null
          terapeuta_id: string
        }
        Update: {
          atualizado_em?: string
          consulta_id?: string | null
          criado_em?: string
          dados?: Json
          id?: string
          leitura?: Json | null
          mostrada_em?: string | null
          mostrar_pessoa?: boolean
          paciente_user_id?: string
          resumo?: string | null
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapia_avaliacoes_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terapia_avaliacoes_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapia_config: {
        Row: {
          atualizado_em: string
          chave: string
          descricao: string | null
          valor: Json
        }
        Insert: {
          atualizado_em?: string
          chave: string
          descricao?: string | null
          valor: Json
        }
        Update: {
          atualizado_em?: string
          chave?: string
          descricao?: string | null
          valor?: Json
        }
        Relationships: []
      }
      terapia_folha_modelos: {
        Row: {
          atualizado_em: string
          criado_em: string
          dados: Json
          descricao: string | null
          do_portal: boolean
          dosha: string | null
          duracao_dias: number | null
          id: string
          nome: string
          serve_para: string[]
          tags: string[]
          terapeuta_id: string | null
          tratamento: string | null
          usos: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          dados?: Json
          descricao?: string | null
          do_portal?: boolean
          dosha?: string | null
          duracao_dias?: number | null
          id?: string
          nome: string
          serve_para?: string[]
          tags?: string[]
          terapeuta_id?: string | null
          tratamento?: string | null
          usos?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          dados?: Json
          descricao?: string | null
          do_portal?: boolean
          dosha?: string | null
          duracao_dias?: number | null
          id?: string
          nome?: string
          serve_para?: string[]
          tags?: string[]
          terapeuta_id?: string | null
          tratamento?: string | null
          usos?: number
        }
        Relationships: [
          {
            foreignKeyName: "terapia_folha_modelos_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapia_folhas: {
        Row: {
          atualizado_em: string
          avaliacao_id: string | null
          consulta_id: string | null
          criado_em: string
          dados: Json
          diagnostico: string | null
          enviada_em: string | null
          id: string
          paciente_user_id: string
          retorno: string | null
          terapeuta_id: string
          tratamento: string | null
          vista_em: string | null
        }
        Insert: {
          atualizado_em?: string
          avaliacao_id?: string | null
          consulta_id?: string | null
          criado_em?: string
          dados?: Json
          diagnostico?: string | null
          enviada_em?: string | null
          id?: string
          paciente_user_id: string
          retorno?: string | null
          terapeuta_id: string
          tratamento?: string | null
          vista_em?: string | null
        }
        Update: {
          atualizado_em?: string
          avaliacao_id?: string | null
          consulta_id?: string | null
          criado_em?: string
          dados?: Json
          diagnostico?: string | null
          enviada_em?: string | null
          id?: string
          paciente_user_id?: string
          retorno?: string | null
          terapeuta_id?: string
          tratamento?: string | null
          vista_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terapia_folhas_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "terapia_avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terapia_folhas_consulta_id_fkey"
            columns: ["consulta_id"]
            isOneToOne: false
            referencedRelation: "consultas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terapia_folhas_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
      }
      terapia_formulario_envios: {
        Row: {
          abertura: string | null
          consulta_id: string | null
          enviado_em: string
          formulario_id: string | null
          id: string
          mostrar_resultado: boolean
          nome: string
          paciente_user_id: string
          perguntas: Json
          pontua: boolean
          respondido_em: string | null
          respostas: Json
          resultado: Json | null
          secoes: Json
          terapeuta_id: string
        }
        Insert: {
          abertura?: string | null
          consulta_id?: string | null
          enviado_em?: string
          formulario_id?: string | null
          id?: string
          mostrar_resultado?: boolean
          nome: string
          paciente_user_id: string
          perguntas?: Json
          pontua?: boolean
          respondido_em?: string | null
          respostas?: Json
          resultado?: Json | null
          secoes?: Json
          terapeuta_id: string
        }
        Update: {
          abertura?: string | null
          consulta_id?: string | null
          enviado_em?: string
          formulario_id?: string | null
          id?: string
          mostrar_resultado?: boolean
          nome?: string
          paciente_user_id?: string
          perguntas?: Json
          pontua?: boolean
          respondido_em?: string | null
          respostas?: Json
          resultado?: Json | null
          secoes?: Json
          terapeuta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "terapia_formulario_envios_formulario_id_fkey"
            columns: ["formulario_id"]
            isOneToOne: false
            referencedRelation: "terapia_formularios"
            referencedColumns: ["id"]
          },
        ]
      }
      terapia_formularios: {
        Row: {
          abertura: string | null
          ativo: boolean
          atualizado_em: string
          criado_em: string
          envio_primeira: boolean
          envio_retorno: boolean
          id: string
          mostrar_resultado: boolean
          nome: string
          origem: string
          perguntas: Json
          pontua: boolean
          secoes: Json
          terapeuta_id: string | null
        }
        Insert: {
          abertura?: string | null
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          envio_primeira?: boolean
          envio_retorno?: boolean
          id?: string
          mostrar_resultado?: boolean
          nome: string
          origem?: string
          perguntas?: Json
          pontua?: boolean
          secoes?: Json
          terapeuta_id?: string | null
        }
        Update: {
          abertura?: string | null
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          envio_primeira?: boolean
          envio_retorno?: boolean
          id?: string
          mostrar_resultado?: boolean
          nome?: string
          origem?: string
          perguntas?: Json
          pontua?: boolean
          secoes?: Json
          terapeuta_id?: string | null
        }
        Relationships: []
      }
      terapia_quadros: {
        Row: {
          atualizado_em: string
          avaliacao_id: string | null
          criado_em: string
          id: string
          imagem_path: string | null
          item: string | null
          mostrar_paciente: boolean
          paciente_user_id: string
          terapeuta_id: string
          tracos: Json
        }
        Insert: {
          atualizado_em?: string
          avaliacao_id?: string | null
          criado_em?: string
          id?: string
          imagem_path?: string | null
          item?: string | null
          mostrar_paciente?: boolean
          paciente_user_id: string
          terapeuta_id: string
          tracos?: Json
        }
        Update: {
          atualizado_em?: string
          avaliacao_id?: string | null
          criado_em?: string
          id?: string
          imagem_path?: string | null
          item?: string | null
          mostrar_paciente?: boolean
          paciente_user_id?: string
          terapeuta_id?: string
          tracos?: Json
        }
        Relationships: [
          {
            foreignKeyName: "terapia_quadros_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "terapia_avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terapia_quadros_terapeuta_id_fkey"
            columns: ["terapeuta_id"]
            isOneToOne: false
            referencedRelation: "portal_terapeutas"
            referencedColumns: ["id"]
          },
        ]
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
      trilha_comecar: {
        Row: {
          ativo: boolean
          conteudo_id: string
          created_at: string
          id: number
          ordem: number
        }
        Insert: {
          ativo?: boolean
          conteudo_id: string
          created_at?: string
          id?: number
          ordem: number
        }
        Update: {
          ativo?: boolean
          conteudo_id?: string
          created_at?: string
          id?: number
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "trilha_comecar_conteudo_id_fkey"
            columns: ["conteudo_id"]
            isOneToOne: true
            referencedRelation: "portal_conteudo"
            referencedColumns: ["id"]
          },
        ]
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
      tutor_detox_aluno: {
        Row: {
          atualizado_em: string
          email: string
          fatos: Json
          inicio: string | null
          inicio_informado_em: string | null
        }
        Insert: {
          atualizado_em?: string
          email: string
          fatos?: Json
          inicio?: string | null
          inicio_informado_em?: string | null
        }
        Update: {
          atualizado_em?: string
          email?: string
          fatos?: Json
          inicio?: string | null
          inicio_informado_em?: string | null
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
      upanishads_verses: {
        Row: {
          created_at: string | null
          id: number
          sanskrit_text: string | null
          section_no: string | null
          source_note: string | null
          translation_pt: string | null
          upanishad_name: string
          verse_no: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          section_no?: string | null
          source_note?: string | null
          translation_pt?: string | null
          upanishad_name: string
          verse_no: string
        }
        Update: {
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          section_no?: string | null
          source_note?: string | null
          translation_pt?: string | null
          upanishad_name?: string
          verse_no?: string
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
      vaisheshika_sutras_verses: {
        Row: {
          adhyaya_no: number
          ahnika_no: number
          created_at: string | null
          id: number
          sanskrit_text: string | null
          source_note: string | null
          sutra_no: number
          translation_pt: string | null
        }
        Insert: {
          adhyaya_no: number
          ahnika_no: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no: number
          translation_pt?: string | null
        }
        Update: {
          adhyaya_no?: number
          ahnika_no?: number
          created_at?: string | null
          id?: never
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no?: number
          translation_pt?: string | null
        }
        Relationships: []
      }
      vayu_purana_verses: {
        Row: {
          chapter_no: number
          chapter_theme: string | null
          created_at: string | null
          id: number
          pada_name: string | null
          sanskrit_text: string | null
          source_note: string | null
          translation_pt: string | null
          verse_no: string
        }
        Insert: {
          chapter_no: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          pada_name?: string | null
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no: string
        }
        Update: {
          chapter_no?: number
          chapter_theme?: string | null
          created_at?: string | null
          id?: never
          pada_name?: string | null
          sanskrit_text?: string | null
          source_note?: string | null
          translation_pt?: string | null
          verse_no?: string
        }
        Relationships: []
      }
      verse_clusters: {
        Row: {
          cluster_key: string
          cluster_theme: string | null
          created_at: string | null
          id: number
          note: string | null
          role: string | null
          source_id: number
          source_table: string
        }
        Insert: {
          cluster_key: string
          cluster_theme?: string | null
          created_at?: string | null
          id?: never
          note?: string | null
          role?: string | null
          source_id: number
          source_table: string
        }
        Update: {
          cluster_key?: string
          cluster_theme?: string | null
          created_at?: string | null
          id?: never
          note?: string | null
          role?: string | null
          source_id?: number
          source_table?: string
        }
        Relationships: []
      }
      verses_search_index: {
        Row: {
          busca_pt: unknown
          id: number
          livro: string
          location_label: string | null
          pdf_page: number | null
          source_id: number
          source_table: string
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
        }
        Insert: {
          busca_pt?: unknown
          id?: never
          livro: string
          location_label?: string | null
          pdf_page?: number | null
          source_id: number
          source_table: string
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Update: {
          busca_pt?: unknown
          id?: never
          livro?: string
          location_label?: string | null
          pdf_page?: number | null
          source_id?: number
          source_table?: string
          translation_pt?: string | null
          verse_no?: string | null
          verse_sanskrit?: string | null
        }
        Relationships: []
      }
      versos_curadoria: {
        Row: {
          autonomia: number | null
          book: string
          chapter_name: string | null
          clareza_publica: number | null
          created_at: string | null
          curador_agente: string | null
          dosha_relacao: string[] | null
          especificidade_clinica: number | null
          id: number
          importancia_canonica: number | null
          nivel: string
          pergunta_reflexiva: string | null
          resumo_pt: string
          sinal_externo: string | null
          sthana: string | null
          temas: string[] | null
          valor_reflexivo: number | null
          verse_id: number
          verse_no: string | null
          verse_sanskrit_preview: string | null
          why_selected: string
        }
        Insert: {
          autonomia?: number | null
          book: string
          chapter_name?: string | null
          clareza_publica?: number | null
          created_at?: string | null
          curador_agente?: string | null
          dosha_relacao?: string[] | null
          especificidade_clinica?: number | null
          id?: never
          importancia_canonica?: number | null
          nivel: string
          pergunta_reflexiva?: string | null
          resumo_pt: string
          sinal_externo?: string | null
          sthana?: string | null
          temas?: string[] | null
          valor_reflexivo?: number | null
          verse_id: number
          verse_no?: string | null
          verse_sanskrit_preview?: string | null
          why_selected: string
        }
        Update: {
          autonomia?: number | null
          book?: string
          chapter_name?: string | null
          clareza_publica?: number | null
          created_at?: string | null
          curador_agente?: string | null
          dosha_relacao?: string[] | null
          especificidade_clinica?: number | null
          id?: never
          importancia_canonica?: number | null
          nivel?: string
          pergunta_reflexiva?: string | null
          resumo_pt?: string
          sinal_externo?: string | null
          sthana?: string | null
          temas?: string[] | null
          valor_reflexivo?: number | null
          verse_id?: number
          verse_no?: string | null
          verse_sanskrit_preview?: string | null
          why_selected?: string
        }
        Relationships: []
      }
      versos_destaque: {
        Row: {
          ativo: boolean
          created_at: string
          fontes: Json
          id: number
          letras: number | null
          livro: string
          nota: number | null
          nota_curadoria: string | null
          pacotes: string[]
          pontos: number | null
          pontos_det: Json | null
          referencia: string
          tema: string
          temas: string[]
          texto_pt: string
          verso_no: string | null
          verso_sanskrit: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          fontes?: Json
          id?: never
          letras?: number | null
          livro: string
          nota?: number | null
          nota_curadoria?: string | null
          pacotes?: string[]
          pontos?: number | null
          pontos_det?: Json | null
          referencia: string
          tema: string
          temas?: string[]
          texto_pt: string
          verso_no?: string | null
          verso_sanskrit?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string
          fontes?: Json
          id?: never
          letras?: number | null
          livro?: string
          nota?: number | null
          nota_curadoria?: string | null
          pacotes?: string[]
          pontos?: number | null
          pontos_det?: Json | null
          referencia?: string
          tema?: string
          temas?: string[]
          texto_pt?: string
          verso_no?: string | null
          verso_sanskrit?: string | null
        }
        Relationships: []
      }
      video_config: {
        Row: {
          atualizado_em: string | null
          chave: string
          valor: string
        }
        Insert: {
          atualizado_em?: string | null
          chave: string
          valor: string
        }
        Update: {
          atualizado_em?: string | null
          chave?: string
          valor?: string
        }
        Relationships: []
      }
      video_presenca: {
        Row: {
          detalhe: Json | null
          em: string
          evento: string
          id: number
          papel: string
          sala_id: string
        }
        Insert: {
          detalhe?: Json | null
          em?: string
          evento: string
          id?: never
          papel: string
          sala_id: string
        }
        Update: {
          detalhe?: Json | null
          em?: string
          evento?: string
          id?: never
          papel?: string
          sala_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_presenca_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "video_salas"
            referencedColumns: ["id"]
          },
        ]
      }
      video_salas: {
        Row: {
          abre_em: string
          codigo_paciente: string
          codigo_terapeuta: string
          consulta_id: string | null
          criado_em: string
          fecha_em: string
          id: string
          minimo_minutos: number
          nome_sala: string
          paciente_nome: string
          paciente_user_id: string | null
          terapeuta_nome: string
          terapeuta_user_id: string | null
          titulo: string | null
        }
        Insert: {
          abre_em?: string
          codigo_paciente?: string
          codigo_terapeuta?: string
          consulta_id?: string | null
          criado_em?: string
          fecha_em?: string
          id?: string
          minimo_minutos?: number
          nome_sala?: string
          paciente_nome: string
          paciente_user_id?: string | null
          terapeuta_nome: string
          terapeuta_user_id?: string | null
          titulo?: string | null
        }
        Update: {
          abre_em?: string
          codigo_paciente?: string
          codigo_terapeuta?: string
          consulta_id?: string | null
          criado_em?: string
          fecha_em?: string
          id?: string
          minimo_minutos?: number
          nome_sala?: string
          paciente_nome?: string
          paciente_user_id?: string | null
          terapeuta_nome?: string
          terapeuta_user_id?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      videos_repetidos: {
        Row: {
          criado_em: string
          fica_video_id: string | null
          grupo: string | null
          motivo: string | null
          video_id: string
        }
        Insert: {
          criado_em?: string
          fica_video_id?: string | null
          grupo?: string | null
          motivo?: string | null
          video_id: string
        }
        Update: {
          criado_em?: string
          fica_video_id?: string | null
          grupo?: string | null
          motivo?: string | null
          video_id?: string
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
      videos_seo2026: {
        Row: {
          atualizado_em: string
          categoria: string | null
          criado_em: string
          duracao_seg: number | null
          excluido: boolean
          legenda: string | null
          legenda_fonte: string | null
          motivo_exclusao: string | null
          origem_lista: string | null
          publicado_em: string | null
          subtemas: string[] | null
          tipo: string | null
          titulo: string | null
          triagem: string | null
          url: string | null
          video_id: string
        }
        Insert: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          duracao_seg?: number | null
          excluido?: boolean
          legenda?: string | null
          legenda_fonte?: string | null
          motivo_exclusao?: string | null
          origem_lista?: string | null
          publicado_em?: string | null
          subtemas?: string[] | null
          tipo?: string | null
          titulo?: string | null
          triagem?: string | null
          url?: string | null
          video_id: string
        }
        Update: {
          atualizado_em?: string
          categoria?: string | null
          criado_em?: string
          duracao_seg?: number | null
          excluido?: boolean
          legenda?: string | null
          legenda_fonte?: string | null
          motivo_exclusao?: string | null
          origem_lista?: string | null
          publicado_em?: string | null
          subtemas?: string[] | null
          tipo?: string | null
          titulo?: string | null
          triagem?: string | null
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
      yoga_sutras_verses: {
        Row: {
          created_at: string | null
          id: number
          pada_name: string | null
          pada_no: number
          sanskrit_text: string | null
          source_note: string | null
          sutra_no: number
          translation_pt: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          pada_name?: string | null
          pada_no: number
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no: number
          translation_pt?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          pada_name?: string | null
          pada_no?: number
          sanskrit_text?: string | null
          source_note?: string | null
          sutra_no?: number
          translation_pt?: string | null
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
          slug: string | null
          titulo: string | null
        }
        Insert: {
          duracao_segundos?: number | null
          id?: string | null
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
          titulo?: string | null
        }
        Update: {
          duracao_segundos?: number | null
          id?: string | null
          modulo_id?: string | null
          ordem?: number | null
          slug?: string | null
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
          agni_nivel: number | null
          agni_tipo: string | null
          data_postagem: string | null
          id: number | null
          kapha_score: number | null
          pitta_score: number | null
          tags: string | null
          texto_inicio: string | null
          texto_resumo: string | null
          titulo: string | null
          vata_score: number | null
        }
        Insert: {
          agni_nivel?: number | null
          agni_tipo?: string | null
          data_postagem?: string | null
          id?: number | null
          kapha_score?: number | null
          pitta_score?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
          vata_score?: number | null
        }
        Update: {
          agni_nivel?: number | null
          agni_tipo?: string | null
          data_postagem?: string | null
          id?: number | null
          kapha_score?: number | null
          pitta_score?: number | null
          tags?: string | null
          texto_inicio?: string | null
          texto_resumo?: string | null
          titulo?: string | null
          vata_score?: number | null
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
      study_program_export: {
        Row: {
          chapter_name: string | null
          chapter_no: string | null
          collection_id: number | null
          item_order: number | null
          livro: string | null
          module_desc: string | null
          module_id: number | null
          module_order: number | null
          module_title: string | null
          sthana: string | null
          translation_pt: string | null
          verse_no: string | null
          verse_sanskrit: string | null
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
      vw_base_quente_primavera: {
        Row: {
          email: string | null
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
      _agora_prazo: { Args: never; Returns: string }
      _bib_item: { Args: { p_ref: string; p_tipo: string }; Returns: Json }
      _certificados_pendentes_de_aviso: {
        Args: { p_user?: string }
        Returns: {
          curso_id: string
          liberado_em: string
          nome_exibicao: string
          slug: string
          user_id: string
        }[]
      }
      _chat_json: {
        Args: {
          c: Database["public"]["Tables"]["chat_conversas"]["Row"]
          p_papel: string
        }
        Returns: Json
      }
      _cuidado_dias: {
        Args: { p_ate: string; p_de: string; p_user: string }
        Returns: string[]
      }
      _data_extenso: { Args: { p: string }; Returns: string }
      _eh_terapeuta: { Args: never; Returns: string }
      _ficha_json: {
        Args: { p_paciente: string; p_terapeuta: string }
        Returns: Json
      }
      _folha_n_itens: { Args: { d: Json }; Returns: number }
      _formulario_enviar: {
        Args: {
          p_consulta: string
          p_formulario: string
          p_paciente: string
          p_tid: string
        }
        Returns: string
      }
      _formulario_resultado: {
        Args: { p_perguntas: Json; p_respostas: Json; p_secoes: Json }
        Returns: Json
      }
      _formulario_valido: {
        Args: { p_perguntas: Json; p_secoes: Json }
        Returns: undefined
      }
      _horario_motivo: {
        Args: { p_com_antecedencia: boolean; p_inicio: string; p_tid: string }
        Returns: string
      }
      _horarios_livres: {
        Args: { p_dias: number; p_terapeuta: string }
        Returns: {
          fim: string
          inicio: string
        }[]
      }
      _html_esc: { Args: { p: string }; Returns: string }
      _liberacao_aplicar: {
        Args: {
          p_curso: string
          p_estender: boolean
          p_expira: string
          p_origem: string
          p_user: string
          p_vitalicio: boolean
        }
        Returns: {
          expira_antes: string
          expira_final: string
          matricula_id: string
        }[]
      }
      _liberacao_expira: {
        Args: { p_base: string; p_curso_id: string; p_prazo: Json }
        Returns: {
          expira: string
          vitalicio: boolean
        }[]
      }
      _nascimento_grava: {
        Args: {
          p_data: string
          p_exterior: string
          p_hora: string
          p_hora_conhecida: boolean
          p_municipio: number
          p_uid: string
        }
        Returns: Json
      }
      _nascimento_json: { Args: { p_uid: string }; Returns: Json }
      _no_sistema: { Args: { p_tid: string }; Returns: boolean }
      _nome_completo_sugerido: { Args: { p_user: string }; Returns: Json }
      _nome_conta: { Args: { p_uid: string }; Returns: string }
      _normalizar_nome: { Args: { p: string }; Returns: string }
      _paciente_meu: { Args: { p_paciente: string }; Returns: string }
      _pedido_json: {
        Args: { p: Database["public"]["Tables"]["consulta_pedidos"]["Row"] }
        Returns: Json
      }
      _pedidos_expirar: { Args: never; Returns: undefined }
      _respostas_expandir: { Args: { p: Json }; Returns: Json }
      _resumo_areas: { Args: { p_registro: string }; Returns: Json }
      _slots_fixos: {
        Args: { p_ate: string; p_de: string; p_terapeuta: string }
        Returns: {
          fim: string
          inicio: string
        }[]
      }
      _slug: { Args: { p: string }; Returns: string }
      _so_admin: { Args: never; Returns: undefined }
      _ter_cfg: { Args: { p_chave: string }; Returns: Json }
      _ter_sis_garante: { Args: { p_tid: string }; Returns: undefined }
      _terapeuta_id_de: { Args: { p_uid: string }; Returns: string }
      _terapeuta_numeros: { Args: { p_tid: string }; Returns: Json }
      _terapeuta_online: { Args: { p_tid: string }; Returns: boolean }
      _terapeuta_por_slug: { Args: { p_slug: string }; Returns: string }
      _terapeuta_premium: { Args: { p_tid: string }; Returns: boolean }
      _terapia_atencao: { Args: { p_tid: string }; Returns: Json }
      _terapia_falta_participar: { Args: { p_tid: string }; Returns: string[] }
      _terapia_novidades: { Args: { p_tid: string }; Returns: Json }
      _teste_completo_de: {
        Args: { p_email: string; p_paciente: string }
        Returns: Json
      }
      _teste_partes: { Args: { p_respostas: Json }; Returns: Json }
      acervo_adicionar: {
        Args: {
          p_antes?: number
          p_depois?: number
          p_id: number
          p_nota: number
          p_pacotes?: string[]
          p_tabela: string
          p_temas: string[]
        }
        Returns: number
      }
      acervo_item: {
        Args: { p_item_slug: string; p_terapeuta_slug: string }
        Returns: Json
      }
      acervo_pacote_alternar: {
        Args: { p_pacote: string; p_verso: number }
        Returns: string[]
      }
      acervo_stats: { Args: never; Returns: Json }
      acervo_versos: {
        Args: never
        Returns: {
          id: number
          letras: number
          livro: string
          pacotes: string[]
          pontos: number
          pontos_det: Json
          referencia: string
          temas: string[]
          texto_pt: string
          verso_no: string
          verso_sanskrit: string
        }[]
      }
      acomp_agenda_minha: { Args: never; Returns: Json }
      acomp_agenda_salvar: { Args: { p_regras: Json }; Returns: undefined }
      acomp_cancelar: { Args: { p_consulta: string }; Returns: undefined }
      acomp_desligar: { Args: { p_ligacao: string }; Returns: undefined }
      acomp_eu: { Args: never; Returns: Json }
      acomp_ficha: { Args: { p_paciente: string }; Returns: Json }
      acomp_fotos: { Args: { p_paciente: string }; Returns: Json }
      acomp_horarios_livres: {
        Args: { p_dias?: number; p_terapeuta: string }
        Returns: Json
      }
      acomp_ligar: {
        Args: { p_codigo: string; p_origem?: string; p_perm_akasha?: boolean }
        Returns: Json
      }
      acomp_marcar: {
        Args: { p_inicio: string; p_terapeuta: string }
        Returns: Json
      }
      acomp_meus_pacientes: { Args: never; Returns: Json }
      acomp_minhas_consultas: { Args: never; Returns: Json }
      acomp_nascimento: { Args: { p_paciente: string }; Returns: Json }
      acomp_nascimento_salvar: {
        Args: {
          p_data: string
          p_exterior?: string
          p_hora?: string
          p_hora_conhecida?: boolean
          p_municipio?: number
          p_paciente: string
        }
        Returns: Json
      }
      acomp_nota_apagar: { Args: { p_nota: string }; Returns: undefined }
      acomp_nota_editar: {
        Args: { p_nota: string; p_texto: string }
        Returns: undefined
      }
      acomp_nota_salvar: {
        Args: { p_consulta?: string; p_paciente: string; p_texto: string }
        Returns: string
      }
      acomp_permissoes: {
        Args: {
          p_akasha: boolean
          p_fotos: boolean
          p_ligacao: string
          p_rotina: boolean
          p_teste: boolean
        }
        Returns: undefined
      }
      acomp_rotina: { Args: { p_paciente: string }; Returns: Json }
      acomp_terapeuta_por_codigo: { Args: { p_codigo: string }; Returns: Json }
      admin_acervo_revisar: {
        Args: { p_decisao: string; p_id: string }
        Returns: undefined
      }
      admin_acervo_sugestoes: { Args: never; Returns: Json }
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
      admin_agenda_mudar_data: {
        Args: { _data?: string; _id: string }
        Returns: string
      }
      admin_agenda_publicar_agora: { Args: { _id: string }; Returns: string }
      admin_agenda_reorganizar: { Args: { _inicio?: string }; Returns: number }
      admin_agenda_tendencia: {
        Args: { p_comunicacao_id: string; p_dias?: number }
        Returns: {
          aberturas: number
          cliques: number
          dia: string
          envios: number
        }[]
      }
      admin_agenda_tirar: { Args: { _id: string }; Returns: undefined }
      admin_agenda_trocar: {
        Args: { _a: string; _b: string }
        Returns: undefined
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
      admin_aluno_ficha: { Args: { p_chave: string }; Returns: Json }
      admin_alunos_config: { Args: never; Returns: Json }
      admin_alunos_lista: {
        Args: {
          p_busca?: string
          p_curso_id?: string
          p_limite?: number
          p_offset?: number
          p_situacao?: string
        }
        Returns: Json
      }
      admin_avaliacao_publicar: {
        Args: { p_consulta: string; p_publicar: boolean }
        Returns: undefined
      }
      admin_avaliacoes: { Args: { p_limite?: number }; Returns: Json }
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
      admin_cancelar_convite: {
        Args: { p_liberacao_id: string }
        Returns: Json
      }
      admin_cancelar_curso: {
        Args: { p_matricula_id: string; p_obs?: string }
        Returns: Json
      }
      admin_dashboard_resumo: { Args: never; Returns: Json }
      admin_estender_curso: {
        Args: {
          p_enviar_email?: boolean
          p_matricula_id: string
          p_obs?: string
          p_prazo: Json
        }
        Returns: Json
      }
      admin_liberar_cursos: {
        Args: {
          p_curso_ids: string[]
          p_email: string
          p_enviar_email?: boolean
          p_obs?: string
          p_prazo?: Json
          p_tipo?: string
        }
        Returns: Json
      }
      admin_reenviar_email_liberacao: {
        Args: { p_lote: string }
        Returns: Json
      }
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
      admin_terapia_consultas: { Args: { p_dias?: number }; Returns: Json }
      admin_terapia_no_sistema: {
        Args: { p_ligar: boolean; p_terapeuta: string }
        Returns: undefined
      }
      admin_terapia_terapeutas: { Args: never; Returns: Json }
      admin_vendas_cursos: {
        Args: never
        Returns: {
          curso_slug: string
          curso_titulo: string
          email: string
          email_informado: string
          liberado_em: string
          meio: string
          metodo: string
          mp_payment_id: string
          nome: string
          parcelas: number
          quando: string
          sem_login: boolean
          situacao: string
          status_detalhe: string
          status_mp: string
          taxa_mp: number
          telefone: string
          valor: number
          valor_liquido: number
        }[]
      }
      admin_vincular_pagamento_curso: {
        Args: { p_email: string; p_mp_payment_id: string }
        Returns: Json
      }
      agenda_destinatarios: {
        Args: { p_comunicacao_id: string }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      agenda_destinatarios_alunos: {
        Args: { p_comunicacao_id: string }
        Returns: {
          email: string
          payload: Json
        }[]
      }
      agenda_destinatarios_certificado: {
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
      akasha_grupo_dosha: { Args: { p_dosha: string }; Returns: string }
      akasha_perguntas_para: {
        Args: { p_dosha: string }
        Returns: {
          grupo: string
          ordem: number
          pergunta: string
          resposta: string
        }[]
      }
      akasha_reset_mensal: { Args: never; Returns: number }
      antiruido_ayurveda: { Args: { t: string }; Returns: string }
      antiruido_desde: { Args: { p_id: number; t: string }; Returns: string }
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
          publicar_em: string | null
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
      artigos_para_comecar: {
        Args: { p_dosha?: string; p_limite?: number }
        Returns: {
          id: string
          imagem: string
          origem: string
          resumo: string
          slug: string
          titulo: string
        }[]
      }
      atividade_abas_lista: {
        Args: { p_curso_id?: string; p_escola_modulo_id?: string }
        Returns: Json
      }
      atividade_abrir: { Args: { p_atividade_id: string }; Returns: Json }
      atividade_chip: {
        Args: { p_cor: string; p_texto: string }
        Returns: string
      }
      atividade_cor_dosha: {
        Args: { p_dosha: string; p_texto?: string }
        Returns: string
      }
      atividade_css_ficha: { Args: never; Returns: string }
      atividade_css_relatorio: { Args: never; Returns: string }
      atividade_entregas: { Args: { p_atividade_id: string }; Returns: Json }
      atividade_esc: { Args: { t: string }; Returns: string }
      atividade_html_relatorio_corpo: {
        Args: { p_atividade_id: string; p_respostas: Json }
        Returns: string
      }
      atividade_html_relatorio_topo: {
        Args: {
          p_atividade_id: string
          p_cfg: Json
          p_cfg_teste: Json
          p_entregue: string
          p_teste: Json
        }
        Returns: string
      }
      atividade_html_teste_dosha: {
        Args: { cfg: Json; t: Json }
        Returns: string
      }
      atividade_icone: { Args: { p_nome: string }; Returns: string }
      atividade_icone_cor: {
        Args: { p_cor: string; p_nome: string }
        Returns: string
      }
      atividade_niveis_dosha: { Args: never; Returns: Json }
      atividade_nivel_dosha: {
        Args: { p_dosha: string; p_pontos: number }
        Returns: Json
      }
      atividade_pinta_doshas: { Args: { t: string }; Returns: string }
      atividade_pode_acessar: {
        Args: { p_atividade_id: string }
        Returns: boolean
      }
      atividade_salvar: {
        Args: {
          p_atividade_id: string
          p_entregar?: boolean
          p_respostas: Json
        }
        Returns: Json
      }
      atividade_teste_dosha_de: { Args: { p_uid: string }; Returns: Json }
      atividade_texto_do_teste: {
        Args: { cfg: Json; t: Json }
        Returns: string
      }
      atividades_lista: {
        Args: {
          p_aba_id?: string
          p_curso_id?: string
          p_escola_modulo_id?: string
        }
        Returns: Json
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
      bulk_merge_verse_sanskrit: {
        Args: { items: Json; target_table: string }
        Returns: number
      }
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
        Args: { p_dosha?: string; p_texto: string }
        Returns: {
          hits: number
          imagem: string
          link: string
          preco: number
          tipo: string
          titulo: string
        }[]
      }
      certificado_para_imprimir: { Args: { p_slug: string }; Returns: Json }
      chat_abrir: { Args: { p_slug: string }; Returns: Json }
      chat_enviar: {
        Args: { p_conversa: string; p_texto: string }
        Returns: Json
      }
      chat_ler: { Args: { p_conversa: string }; Returns: undefined }
      chat_mensagens_de: {
        Args: { p_antes?: number; p_conversa: string }
        Returns: Json
      }
      chat_minhas: { Args: never; Returns: Json }
      chat_nao_lidas: { Args: never; Returns: number }
      claim_dosha_test: { Args: { p_id_publico?: string }; Returns: Json }
      classicos_capitulo: {
        Args: { p_capitulo_id: number }
        Returns: {
          anterior_id: number
          anterior_rota: string
          anterior_titulo: string
          capitulo_id: number
          estante: string
          n_versos: number
          nivel1: string
          nivel2: string
          obra_devanagari: string
          obra_nome: string
          obra_slug: string
          proximo_id: number
          proximo_rota: string
          proximo_titulo: string
          resumo: string
          rota: string
          rotulo_nivel1: string
          rotulo_nivel2: string
          temas: string[]
          titulo_devanagari: string
          titulo_pt: string
          titulo_translit: string
        }[]
      }
      classicos_capitulo_por_rota: {
        Args: { p_obra: string; p_rota: string }
        Returns: {
          anterior_id: number
          anterior_rota: string
          anterior_titulo: string
          capitulo_id: number
          estante: string
          n_versos: number
          nivel1: string
          nivel2: string
          obra_devanagari: string
          obra_nome: string
          obra_slug: string
          proximo_id: number
          proximo_rota: string
          proximo_titulo: string
          resumo: string
          rota: string
          rotulo_nivel1: string
          rotulo_nivel2: string
          temas: string[]
          titulo_devanagari: string
          titulo_pt: string
          titulo_translit: string
        }[]
      }
      classicos_capitulo_versos: {
        Args: { p_capitulo_id: number; p_limite?: number; p_offset?: number }
        Returns: {
          ordem: number
          sanscrito: string
          texto_pt: string
          verso_no: string
        }[]
      }
      classicos_capitulos_por_tema: {
        Args: { p_limite?: number; p_offset?: number; p_tema: string }
        Returns: {
          capitulo_id: number
          n_versos: number
          nivel1: string
          nivel2: string
          obra_nome: string
          obra_slug: string
          rota: string
          rotulo_nivel1: string
          rotulo_nivel2: string
          titulo_pt: string
          titulo_translit: string
          total: number
        }[]
      }
      classicos_chave_planta: { Args: { p_iast: string }; Returns: string }
      classicos_estante: {
        Args: never
        Returns: {
          apresentacao: string
          autor: string
          capa_url: string
          completude: string
          epoca: string
          estante: string
          nome: string
          nome_devanagari: string
          nota_estado: string
          slug: string
          total_capitulos: number
          total_versos: number
        }[]
      }
      classicos_inventario: {
        Args: never
        Returns: {
          capitulos: number
          com_nome_capitulo: number
          com_sanscrito: number
          com_traducao: number
          entradas_planta: number
          estrutura: string
          obra: string
          secoes: number
          tabela: string
          versos: number
        }[]
      }
      classicos_letras_plantas: {
        Args: { p_obra?: string }
        Returns: {
          letra: string
          total: number
        }[]
      }
      classicos_ordem_secao: { Args: { p_nome: string }; Returns: number }
      classicos_para_dosha: { Args: { p_dosha: string }; Returns: Json }
      classicos_planta: {
        Args: { p_chave: string }
        Returns: {
          chave: string
          descricao: string
          id: number
          n_obras: number
          n_versos: number
          nome: string
          nome_devanagari: string
          nome_latim: string
          nome_popular: string
        }[]
      }
      classicos_planta_ler: {
        Args: { p_planta_id: number }
        Returns: {
          entrada: string
          obra: string
          obra_slug: string
          sanscrito: string
          texto_pt: string
          verso_no: string
        }[]
      }
      classicos_plantas_listar: {
        Args: {
          p_busca?: string
          p_letra?: string
          p_limite?: number
          p_minimo_obras?: number
          p_obra?: string
          p_offset?: number
          p_so_com_popular?: boolean
        }
        Returns: {
          chave: string
          id: number
          n_obras: number
          n_versos: number
          nome: string
          nome_devanagari: string
          nome_latim: string
          nome_popular: string
          total: number
          versos_nesta_obra: number
        }[]
      }
      classicos_plantas_sincronizar: {
        Args: never
        Returns: {
          entradas: number
          obra: string
        }[]
      }
      classicos_reindexar: {
        Args: { p_slug?: string }
        Returns: {
          linhas: number
          obra: string
        }[]
      }
      classicos_rota: { Args: { p_capitulo_id: number }; Returns: string }
      classicos_sincronizar: {
        Args: { p_slug?: string }
        Returns: {
          capitulos_gravados: number
          obra: string
          versos: number
        }[]
      }
      classicos_slug: { Args: { p_texto: string }; Returns: string }
      classicos_sumario: {
        Args: { p_obra: string }
        Returns: {
          capitulo_id: number
          n_versos: number
          nivel1: string
          nivel1_ordem: number
          nivel2: string
          nivel2_ordem: number
          resumo: string
          rota: string
          rotulo_nivel1: string
          rotulo_nivel2: string
          temas: string[]
          titulo_devanagari: string
          titulo_pt: string
          titulo_translit: string
          verso_final: string
          verso_inicial: string
        }[]
      }
      classicos_temas: {
        Args: never
        Returns: {
          rotulo: string
          tema: string
          total: number
        }[]
      }
      classicos_temas_automaticos: {
        Args: { p_estante?: string; p_texto: string }
        Returns: string[]
      }
      classicos_titulo_automatico: {
        Args: { p_amostra: string }
        Returns: string
      }
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
      consulta_agora_cancelar: { Args: { p_id: string }; Returns: undefined }
      consulta_agora_confirmar: {
        Args: {
          p_akasha?: boolean
          p_fotos?: boolean
          p_id: string
          p_rotina?: boolean
          p_teste?: boolean
        }
        Returns: Json
      }
      consulta_agora_do_pedido: { Args: { p_id: string }; Returns: Json }
      consulta_agora_meu: { Args: { p_id: string }; Returns: Json }
      consulta_agora_pedidos: { Args: never; Returns: Json }
      consulta_agora_pedir: {
        Args: { p_motivo?: string; p_slug: string }
        Returns: Json
      }
      consulta_agora_responder: {
        Args: { p_aceitar: boolean; p_em_minutos?: number; p_id: string }
        Returns: Json
      }
      consulta_ao_vivo: { Args: { p_consulta: string }; Returns: Json }
      consulta_avaliar: {
        Args: { p_comentario?: string; p_consulta: string; p_nota: number }
        Returns: undefined
      }
      consulta_gravando: {
        Args: { p_consulta: string; p_gravando: boolean }
        Returns: undefined
      }
      consulta_motivo_salvar: {
        Args: { p_consulta: string; p_texto: string }
        Returns: undefined
      }
      consulta_quadro_mostrar: {
        Args: { p_consulta: string; p_quadro: string }
        Returns: undefined
      }
      consulta_remarcar: {
        Args: { p_consulta: string; p_inicio: string }
        Returns: Json
      }
      consulta_sala: { Args: { p_consulta: string }; Returns: Json }
      convite_previa: { Args: { p_slug?: string }; Returns: Json }
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
      cuidados_fita: { Args: never; Returns: Json }
      curso_email_confirmacao_conteudo: {
        Args: {
          p_com_nome: boolean
          p_slug: string
          p_titulo: string
          p_whatsapp: string
        }
        Returns: Json
      }
      curso_liberacao_email_enviar: {
        Args: { p_lote: string }
        Returns: string
      }
      curso_pagamento_estornado: {
        Args: { p_mp_payment_id: string; p_status: string }
        Returns: Json
      }
      curso_pagamento_registrar: { Args: { p: Json }; Returns: Json }
      cursos_para_mim: {
        Args: never
        Returns: {
          capa: string
          cor: string
          id: string
          link: string
          ordem: number
          rotulo: string
          slug: string
          subtitulo: string
          tem: boolean
          titulo: string
        }[]
      }
      descadastro_confirmar: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      descadastro_token: { Args: { p_email: string }; Returns: string }
      desvincular_teste: { Args: { p_id_publico: string }; Returns: Json }
      detox_aula_do_dia: { Args: { p_dia?: string }; Returns: string }
      detox_cortar: {
        Args: {
          p_alvo?: number
          p_max?: number
          p_min?: number
          p_sobra?: number
          p_video_id: string
        }
        Returns: number
      }
      detox_dia_por_data: {
        Args: { p_hoje?: string; p_inicio?: string }
        Returns: number
      }
      detox_dia_semana: { Args: { d: string }; Returns: string }
      detox_email_confirmacao_conteudo: {
        Args: { p_com_nome: boolean; p_hoje: string }
        Returns: Json
      }
      detox_embed_lote: { Args: { p_lote?: number }; Returns: number }
      detox_encerra_premium: { Args: never; Returns: number }
      detox_fases_do_trecho: {
        Args: { p_padrao: string[]; t: string }
        Returns: string[]
      }
      detox_limpar_frases: { Args: { t: string }; Returns: string }
      detox_limpar_frases2: { Args: { t: string }; Returns: string }
      detox_norm: { Args: { p: string }; Returns: string }
      detox_pont_ciclo: {
        Args: { p_modelo?: string; p_voo?: number }
        Returns: Json
      }
      detox_pont_ciclo_com_divisao: { Args: { p_voo?: number }; Returns: Json }
      detox_pont_conferir: {
        Args: { p_id: number; p_saida: string }
        Returns: string
      }
      detox_pont_dividir: { Args: never; Returns: number }
      detox_pont_montar: {
        Args: { p_tam?: number; p_video_id: string }
        Returns: number
      }
      detox_sem_acento: { Args: { p: string }; Returns: string }
      devanagari_iast: { Args: { p_texto: string }; Returns: string }
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
      escola_continuar: {
        Args: never
        Returns: {
          atualizado_em: string
          duracao_segundos: number
          modulo_id: string
          modulo_numero: number
          modulo_slug: string
          modulo_titulo: string
          recurso_id: string
          segundos: number
          titulo: string
        }[]
      }
      escola_marcar_concluida: {
        Args: { p_concluida: boolean; p_recurso_id: string }
        Returns: undefined
      }
      escola_progresso_modulos: {
        Args: never
        Returns: {
          aulas_vistas: number
          modulo_id: string
          total_aulas: number
        }[]
      }
      escola_salvar_posicao: {
        Args: {
          p_duracao_segundos?: number
          p_recurso_id: string
          p_segundos: number
        }
        Returns: undefined
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
      formulario_meu: { Args: { p_envio: string }; Returns: Json }
      formulario_responder: {
        Args: { p_envio: string; p_final?: boolean; p_respostas: Json }
        Returns: Json
      }
      formularios_meus: { Args: never; Returns: Json }
      foto_apagar: { Args: { p_id: string }; Returns: string }
      foto_registrar: {
        Args: {
          p_path: string
          p_pedido?: string
          p_tipo: string
          p_titulo?: string
        }
        Returns: string
      }
      fotos_minhas: { Args: never; Returns: Json }
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
      get_verse_cluster_siblings: {
        Args: { p_source_id: number; p_source_table: string }
        Returns: {
          cluster_key: string
          cluster_theme: string
          livro: string
          location_label: string
          sibling_note: string
          sibling_source_id: number
          sibling_source_table: string
          translation_pt: string
          verse_no: string
        }[]
      }
      girar_destaques_index: { Args: never; Returns: string }
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
      immutable_unaccent: { Args: { "": string }; Returns: string }
      indicacao_marcar: {
        Args: {
          p_dia?: string
          p_feito: boolean
          p_folha: string
          p_item: string
        }
        Returns: undefined
      }
      indicacao_vista: { Args: { p_folha: string }; Returns: undefined }
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
      jornada_classifica: {
        Args: { estado: Json; lingua: Json; teste: Json }
        Returns: string
      }
      jornada_dossies: { Args: { p_so_pendentes?: boolean }; Returns: Json[] }
      jornada_dossies_lidos: {
        Args: { p_so_pendentes?: boolean }
        Returns: Json[]
      }
      jornada_estado_teste: { Args: { d: Json }; Returns: Json }
      jornada_lingua_conta: { Args: { r: Json }; Returns: Json }
      jornada_sintese_gravar: {
        Args: { p_texto: string; p_uid: string }
        Returns: string
      }
      kit_detalhe: { Args: { p_slug: string }; Returns: Json }
      kit_expandir: {
        Args: { p_base?: number; p_escolhas?: Json; p_slug: string }
        Returns: Json
      }
      kit_ja_comprado: { Args: { p_slug: string }; Returns: boolean }
      lingua_minhas: { Args: { p_programa: string }; Returns: Json }
      lingua_salvar: {
        Args: { p_foto_path: string; p_n: number; p_programa: string }
        Returns: Json
      }
      lista_de_compras: {
        Args: {
          p_nugget_ids?: string[]
          p_pessoas?: number
          p_semana?: number
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
      live_detectada: { Args: { p_video_id: string }; Returns: string }
      live_troca_do_dia: { Args: never; Returns: string }
      marcar_visto: {
        Args: { p_id: string; p_tipo: string }
        Returns: undefined
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
      match_detox_n8n: {
        Args: { filter?: Json; match_count?: number; query_embedding: string }
        Returns: {
          content: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
      match_detox_primavera: {
        Args: {
          match_count?: number
          p_dia?: number
          p_dosha?: string
          query_embedding: string
        }
        Returns: {
          ano: number
          content: string
          doshas: string[]
          fases: string[]
          fonte: string
          id: number
          minuto: number
          rotulo: string
          score: number
          similarity: number
          url_youtube: string
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
      md_acesso: { Args: { p_uid: string }; Returns: Json }
      md_agni:
        | { Args: { forte: number; fraco: number; irr: number }; Returns: Json }
        | { Args: { p_txt: string }; Returns: Record<string, unknown> }
      md_cab: {
        Args: { icone: string; novo?: boolean; titulo: string }
        Returns: string
      }
      md_cor: { Args: { d: string; uso: string }; Returns: string }
      md_css: { Args: never; Returns: string }
      md_cur: { Args: { e: Json }; Returns: Json }
      md_d: { Args: { x: string }; Returns: string }
      md_dest: { Args: { r: Json }; Returns: string }
      md_destaque: {
        Args: { k: number; p: number; v: number }
        Returns: string
      }
      md_dia: { Args: { t: string }; Returns: string }
      md_dist: { Args: { d: string; s: number }; Returns: number }
      md_dn: { Args: { d: string }; Returns: string }
      md_e: { Args: { a: string[] }; Returns: string }
      md_esc: { Args: { t: string }; Returns: string }
      md_estado: { Args: { p_ref: string; p_uid: string }; Returns: Json }
      md_faixa: { Args: { z: number }; Returns: string }
      md_faixa_nome: { Args: { p_dosha: string; p_v: number }; Returns: string }
      md_faixa_normal: {
        Args: { p_dosha: string }
        Returns: Record<string, unknown>
      }
      md_faixas: { Args: { p_dosha: string }; Returns: number[] }
      md_frase_faltam: {
        Args: { d: string; s: Json; val: number }
        Returns: string
      }
      md_grafico_html_de: { Args: { d: Json; p_cfg?: Json }; Returns: string }
      md_html_agni: { Args: { meta: number; nivel: number }; Returns: string }
      md_html_quadro: {
        Args: { k: number; p: number; v: number }
        Returns: string
      }
      md_html_rev: {
        Args: { dest: string; rev: Json; s: Json }
        Returns: string
      }
      md_icone: { Args: { nome: string; tam?: number }; Returns: string }
      md_limpa: { Args: { t: string }; Returns: string }
      md_lingua: { Args: { p_uid: string }; Returns: Json }
      md_lingua_rotulo: { Args: { n: number; s: Json }; Returns: string }
      md_linha: {
        Args: { corpo: string; icone: string; slug: string; titulo: string }
        Returns: string
      }
      md_lk: {
        Args: { cls?: string; evento?: string; href: string; txt: string }
        Returns: string
      }
      md_mes: { Args: { x: string }; Returns: string }
      md_mes_longo: { Args: { x: string }; Returns: string }
      md_montar: {
        Args: { p_grava: boolean; p_ref: string; p_slot: string; p_uid: string }
        Returns: string
      }
      md_n:
        | {
            Args: { x: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.md_n(x => float8), public.md_n(x => numeric). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { x: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.md_n(x => float8), public.md_n(x => numeric). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      md_nome: { Args: { d: string }; Returns: string }
      md_norm: { Args: { t: string }; Returns: string }
      md_novo: { Args: { s: Json }; Returns: boolean }
      md_oa: { Args: { tipo: string }; Returns: string }
      md_passo: { Args: { p_dosha: string; p_v: number }; Returns: number }
      md_pilha_cartao: {
        Args: { s: Json; texto: string; titulo?: string }
        Returns: string
      }
      md_posicao:
        | { Args: { p_dosha: string; p_v: number }; Returns: number }
        | { Args: { d: string; s: number }; Returns: number }
      md_regs: {
        Args: { p_id: string; p_user: string }
        Returns: {
          agni: string
          created_at: string
          kapha: number
          m: string
          pitta: number
          tipo: string
          vata: number
        }[]
      }
      md_regua: { Args: { d: string }; Returns: number[] }
      md_rev: { Args: { p_sess: string }; Returns: Json }
      md_rodape: { Args: { frase: string; lk?: string }; Returns: string }
      md_sec_akasha: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_aviso: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_caminho: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_cursos: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_digestao: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_doshas: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_evolucao: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_lingua: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_lingua_pagina: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_momento: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_passo: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_pilha: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_pontos: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_refazer: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_retrato: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_revisoes: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_revisoes_pagina: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_rotina: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_sintomas: { Args: { e: Json; s: Json }; Returns: string }
      md_sec_tipos: { Args: { e: Json; s: Json }; Returns: string }
      md_sintomas: { Args: { tags: string }; Returns: string[] }
      md_svg: {
        Args: { cfg: Json; p_cel: boolean; p_dados: Json }
        Returns: string
      }
      md_svg_evolucao: {
        Args: { cols: Json; dest: string; gid?: string; w?: number }
        Returns: string
      }
      md_svg_pizza: {
        Args: { k: number; p: number; v: number }
        Returns: string
      }
      md_t: {
        Args: { chave: string; padrao: string; s: Json; vars?: Json }
        Returns: string
      }
      md_titulo: {
        Args: { k: number; p: number; v: number }
        Returns: string[]
      }
      md_titulo_secao: {
        Args: { padrao: string; s: Json; vars?: Json }
        Returns: string
      }
      md_topo: { Args: { e: Json }; Returns: Json }
      md_zn: { Args: { d: string; s: number }; Returns: number }
      md_zona: { Args: { d: string; s: number }; Returns: string }
      meu_dia: {
        Args: { p_idpublico: string }
        Returns: {
          imagem: string
          nugget_id: string
          rotulo: string
          slot: string
          slug: string
          titulo: string
        }[]
      }
      meu_dosha_grafico: {
        Args: { p_idpublico: string; p_meses?: number }
        Returns: Json
      }
      meu_dosha_grafico_dados: { Args: { p_idpublico: string }; Returns: Json }
      meu_dosha_grafico_html: { Args: { p_idpublico: string }; Returns: string }
      meu_dosha_grafico_previa: {
        Args: { p_caso: string; p_cfg: Json }
        Returns: string
      }
      meu_terapeuta: { Args: never; Returns: Json }
      meus_agravamentos: {
        Args: never
        Returns: {
          dosha: string
          prioridade: number
          sintoma: string
        }[]
      }
      meus_pontos_atencao: { Args: never; Returns: Json }
      minha_folha: { Args: { p_id: string }; Returns: Json }
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
      minhas_avaliacoes: { Args: never; Returns: Json }
      minhas_consultas_acompanhamento: { Args: never; Returns: Json }
      minhas_indicacoes: { Args: never; Returns: Json }
      mockups_buscar: {
        Args: {
          p_limite?: number
          p_offset?: number
          p_termo?: string
          p_tipo?: string
        }
        Returns: Json
      }
      mockups_dados: { Args: never; Returns: Json }
      municipios_busca: {
        Args: { p_q: string; p_uf?: string }
        Returns: {
          codigo_ibge: number
          fuso: string
          nome: string
          uf: string
        }[]
      }
      nascimento_meu: { Args: never; Returns: Json }
      nascimento_salvar: {
        Args: {
          p_data: string
          p_exterior?: string
          p_hora?: string
          p_hora_conhecida?: boolean
          p_municipio?: number
        }
        Returns: Json
      }
      obter_certificado_curso: { Args: { p_curso_id: string }; Returns: Json }
      owns_rotina: { Args: { p_test_id: string }; Returns: boolean }
      participa_conversa: { Args: { p_conversa: string }; Returns: boolean }
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
      pode_ver_acervo_de: { Args: { p_dono: string }; Returns: boolean }
      pode_ver_fotos_de: { Args: { p_dono: string }; Returns: boolean }
      pode_ver_quadro: { Args: { p_path: string }; Returns: boolean }
      pontos_atencao_de: { Args: { p_registro: string }; Returns: Json }
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
      primeiro_nome_norm: { Args: { p_nome: string }; Returns: string }
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
      publicar_artigo_do_dia: { Args: never; Returns: string }
      random_curated_verse: {
        Args: { collection_slug?: string }
        Returns: {
          livro: string
          location_label: string
          translation_pt: string
          verse_no: string
          verse_sanskrit: string
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
      receitas_catalogo: {
        Args: never
        Returns: {
          busca: string
          grupo: string
          grupo_nome: string
          grupo_ordem: number
          id: string
          ingredientes: string[]
          kapha: number
          pitta: number
          titulo: string
          vata: number
        }[]
      }
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
      registrar_evento_email_ses: { Args: { p: Json }; Returns: number }
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
          agniforte: number
          agnifraco: number
          agniirregular: number
          agniPrincipal: string
          agravKaphaTags: string
          agravPittaTags: string
          agravVataTags: string
          altura: string
          cidade: string
          conhecimentoAyurveda: string
          created_at: string
          criado_por: string
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
          user_id: string
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
        Args: { p_semana?: number; p_teste_id: string }
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
      salvar_posicao_aula: {
        Args: {
          p_aula_id: string
          p_duracao_segundos?: number
          p_segundos: number
        }
        Returns: undefined
      }
      search_classical_verses: {
        Args: { lim?: number; off?: number; q: string }
        Returns: {
          livro: string
          location_label: string
          total_count: number
          translation_pt: string
          verse_no: string
          verse_sanskrit: string
        }[]
      }
      secao_evento: {
        Args: { p_evento: string; p_slug: string }
        Returns: undefined
      }
      secoes_html: { Args: { p_ref?: string; p_slot: string }; Returns: string }
      secoes_lugares_ativos: { Args: never; Returns: string[] }
      sede_predominante_dosha: {
        Args: { p_dosha: string; p_tags: string }
        Returns: string
      }
      semana_rotina_atual: {
        Args: { p_semana?: number; p_teste_id: string }
        Returns: number
      }
      seo_conteudo: { Args: { p_path: string }; Returns: Json }
      seo_meta: { Args: { p_path: string }; Returns: Json }
      seo_slug_video: { Args: { p_titulo: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      slug_texto: { Args: { maximo?: number; t: string }; Returns: string }
      sou_aluno_escola: { Args: never; Returns: boolean }
      sou_terapeuta: { Args: never; Returns: boolean }
      tag_normalizar: { Args: { p: string }; Returns: string }
      tem_acesso_curso: { Args: { p_curso_id: string }; Returns: boolean }
      tem_desconto_15: { Args: { p_user: string }; Returns: boolean }
      terapeuta_agenda_publica: {
        Args: { p_dias?: number; p_slug: string }
        Returns: Json
      }
      terapeuta_avaliacoes_publicas: {
        Args: { p_limite?: number; p_slug: string }
        Returns: Json
      }
      terapeuta_marcar_publico: {
        Args: {
          p_akasha?: boolean
          p_fotos?: boolean
          p_inicio: string
          p_motivo?: string
          p_rotina?: boolean
          p_slug: string
          p_teste?: boolean
        }
        Returns: Json
      }
      terapeuta_reservar: {
        Args: { p_inicio: string; p_slug: string }
        Returns: string
      }
      terapeutas_no_sistema: { Args: never; Returns: Json }
      terapeutas_perto: {
        Args: { p_idpublico?: string; p_uf?: string }
        Returns: Json
      }
      terapia_acervo: { Args: never; Returns: Json }
      terapia_acervo_apagar: { Args: { p_id: string }; Returns: string }
      terapia_acervo_salvar: { Args: { p: Json }; Returns: Json }
      terapia_agenda_semana: { Args: { p_inicio?: string }; Returns: Json }
      terapia_aniversario: {
        Args: { p_dia: number; p_mes: number }
        Returns: Json
      }
      terapia_avaliacao: { Args: { p_id: string }; Returns: Json }
      terapia_avaliacao_apagar: { Args: { p_id: string }; Returns: undefined }
      terapia_avaliacao_mostrar: {
        Args: { p_id: string; p_mostrar: boolean }
        Returns: Json
      }
      terapia_avaliacao_nova: {
        Args: { p_consulta?: string; p_paciente: string }
        Returns: string
      }
      terapia_avaliacao_salvar: {
        Args: {
          p_dados: Json
          p_id: string
          p_leitura?: Json
          p_resumo?: string
        }
        Returns: string
      }
      terapia_avaliacoes_da: { Args: { p_paciente: string }; Returns: Json }
      terapia_biblioteca: { Args: never; Returns: Json }
      terapia_biblioteca_portal: {
        Args: {
          p_limite?: number
          p_offset?: number
          p_q?: string
          p_tipo: string
        }
        Returns: Json
      }
      terapia_biblioteca_salvar: { Args: { p_dados: Json }; Returns: undefined }
      terapia_bloqueio_add: {
        Args: { p_dia: string; p_motivo?: string }
        Returns: undefined
      }
      terapia_bloqueio_tirar: { Args: { p_id: string }; Returns: undefined }
      terapia_bloqueios: { Args: never; Returns: Json }
      terapia_busca_portal: {
        Args: { p_limite?: number; p_q: string }
        Returns: Json
      }
      terapia_config_publica: { Args: never; Returns: Json }
      terapia_config_salvar: {
        Args: { p_chave: string; p_valor: Json }
        Returns: undefined
      }
      terapia_conhecimento_busca: {
        Args: { p_q: string; p_tipos?: string[] }
        Returns: Json
      }
      terapia_conhecimento_nucleo: { Args: never; Returns: Json }
      terapia_conversas: { Args: never; Returns: Json }
      terapia_convite: { Args: { p_slug: string }; Returns: Json }
      terapia_convite_aceitar: {
        Args: {
          p_akasha?: boolean
          p_fotos?: boolean
          p_rotina?: boolean
          p_slug: string
          p_teste?: boolean
        }
        Returns: Json
      }
      terapia_dia: {
        Args: { p_abrir: boolean; p_dia: string; p_motivo?: string }
        Returns: Json
      }
      terapia_favoritar: {
        Args: { p_favorito: boolean; p_ref: string; p_tipo: string }
        Returns: boolean
      }
      terapia_ficha_conteudo: { Args: never; Returns: Json }
      terapia_folha: { Args: { p_id: string }; Returns: Json }
      terapia_folha_apagar: { Args: { p_id: string }; Returns: undefined }
      terapia_folha_comecos: { Args: { p_paciente: string }; Returns: Json }
      terapia_folha_enviar: { Args: { p_id: string }; Returns: string }
      terapia_folha_nova: {
        Args: { p_avaliacao?: string; p_consulta?: string; p_paciente: string }
        Returns: string
      }
      terapia_folha_nova_de: {
        Args: {
          p_avaliacao?: string
          p_consulta?: string
          p_folha_origem?: string
          p_modelo?: string
          p_paciente: string
        }
        Returns: string
      }
      terapia_folha_salvar: {
        Args: {
          p_dados: Json
          p_diagnostico?: string
          p_id: string
          p_retorno?: string
          p_tratamento?: string
        }
        Returns: string
      }
      terapia_folhas_da: { Args: { p_paciente: string }; Returns: Json }
      terapia_formulario: { Args: { p_id: string }; Returns: Json }
      terapia_formulario_apagar: { Args: { p_id: string }; Returns: undefined }
      terapia_formulario_copiar: { Args: { p_id: string }; Returns: string }
      terapia_formulario_enviar: {
        Args: { p_consulta?: string; p_formulario: string; p_paciente: string }
        Returns: string
      }
      terapia_formulario_envios: { Args: { p_paciente: string }; Returns: Json }
      terapia_formulario_salvar: { Args: { p: Json }; Returns: string }
      terapia_formularios: { Args: never; Returns: Json }
      terapia_foto_pedido_cancelar: {
        Args: { p_id: string }
        Returns: undefined
      }
      terapia_foto_pedidos: { Args: { p_paciente: string }; Returns: Json }
      terapia_foto_pedir: {
        Args: {
          p_ate?: string
          p_instrucao?: string
          p_modelo?: string
          p_paciente: string
          p_titulo: string
        }
        Returns: string
      }
      terapia_foto_registrar: {
        Args: { p_paciente: string; p_path: string; p_titulo?: string }
        Returns: string
      }
      terapia_hoje: { Args: never; Returns: Json }
      terapia_horario: {
        Args: { p_abrir: boolean; p_fim: string; p_inicio: string }
        Returns: Json
      }
      terapia_indicacoes_fontes: { Args: { p_paciente: string }; Returns: Json }
      terapia_manutencao: { Args: never; Returns: Json }
      terapia_marcar_para: {
        Args: { p_inicio: string; p_paciente: string }
        Returns: Json
      }
      terapia_modelo: { Args: { p_id: string }; Returns: Json }
      terapia_modelo_apagar: { Args: { p_id: string }; Returns: undefined }
      terapia_modelo_copiar: { Args: { p_id: string }; Returns: string }
      terapia_modelo_gravar: { Args: { p: Json }; Returns: string }
      terapia_modelo_salvar: {
        Args: { p_folha: string; p_id?: string; p_nome: string }
        Returns: string
      }
      terapia_modelos: { Args: never; Returns: Json }
      terapia_no_sistema: { Args: { p_ligar: boolean }; Returns: boolean }
      terapia_online: { Args: { p_ligar: boolean }; Returns: boolean }
      terapia_painel_eu: { Args: never; Returns: Json }
      terapia_perfil_salvar: { Args: { p: Json }; Returns: undefined }
      terapia_ping: { Args: never; Returns: Json }
      terapia_preferencias_salvar: { Args: { p: Json }; Returns: undefined }
      terapia_primeiros_passos: { Args: never; Returns: Json }
      terapia_quadro_apagar: { Args: { p_id: string }; Returns: string }
      terapia_quadro_guardar: {
        Args: {
          p_avaliacao: string
          p_id?: string
          p_imagem_path: string
          p_item: string
          p_tracos: Json
        }
        Returns: string
      }
      terapia_quadro_mostrar: {
        Args: { p_id: string; p_mostrar: boolean }
        Returns: undefined
      }
      terapia_quadros_da: { Args: { p_avaliacao: string }; Returns: Json }
      terapia_retorno_sugestoes: { Args: { p_paciente: string }; Returns: Json }
      terapia_sala_treino: { Args: never; Returns: Json }
      terapia_semana: { Args: { p_inicio?: string }; Returns: Json }
      terapia_tarot: { Args: { p_numero?: number }; Returns: Json }
      terapia_termo_aceitar: { Args: { p_versao: string }; Returns: undefined }
      termos_aplicar: { Args: { p_html: string }; Returns: string }
      text_to_bytea: { Args: { data: string }; Returns: string }
      tutor_detox_contexto: { Args: { p_email: string }; Returns: Json }
      tutor_detox_lembrar: {
        Args: { p_dia?: number; p_email: string; p_fato?: string }
        Returns: Json
      }
      tutor_detox_lembrar_json: {
        Args: { p_email: string; p_texto: string }
        Returns: Json
      }
      tutor_detox_lembrar_lote: {
        Args: {
          p_dia?: string
          p_email: string
          p_fatos?: Json
          p_inicio?: string
        }
        Returns: Json
      }
      tutor_detox_resumo: { Args: { ctx: Json }; Returns: string }
      ultima_aula_do_curso: {
        Args: { p_curso_id: string }
        Returns: {
          atualizado_em: string
          aula_id: string
          duracao_segundos: number
          segundos: number
          titulo: string
        }[]
      }
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
      usuario_id_por_email: { Args: { p_email: string }; Returns: string }
      verse_of_the_day: {
        Args: { collection_slug?: string }
        Returns: {
          livro: string
          location_label: string
          translation_pt: string
          verse_no: string
          verse_sanskrit: string
        }[]
      }
      verso_expandido: {
        Args: {
          p_antes?: number
          p_depois?: number
          p_id: number
          p_tabela: string
        }
        Returns: {
          continua_anterior: boolean
          eh_o_pedido: boolean
          posicao: number
          sanskrit: string
          source_id: number
          source_table: string
          texto_pt: string
          verso_no: string
        }[]
      }
      verso_expandido_texto: {
        Args: {
          p_antes?: number
          p_depois?: number
          p_id: number
          p_tabela: string
        }
        Returns: {
          fontes: Json
          letras: number
          n_versos: number
          sanskrit: string
          texto_pt: string
          versos: string
        }[]
      }
      verso_ordem_num: { Args: { v: string }; Returns: number }
      video_sala_resumo: { Args: { p_sala: string }; Returns: Json }
      video_slug_sitemap: { Args: { p_titulo: string }; Returns: string }
      videos_seo2_sincronizar: { Args: never; Returns: number }
      videos_slugify: { Args: { p_titulo: string }; Returns: string }
      vincular_teste: { Args: { p_id_publico: string }; Returns: Json }
      vtt_falas: {
        Args: { p_leg: string }
        Returns: {
          ordem: number
          seg: number
          texto: string
        }[]
      }
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
