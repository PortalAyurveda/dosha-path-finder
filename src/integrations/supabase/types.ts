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
      akasha_memory: {
        Row: {
          data_postagem: string | null
          id: number
          tags: string | null
          texto_inicio: string | null
          titulo: string | null
        }
        Insert: {
          data_postagem?: string | null
          id?: number
          tags?: string | null
          texto_inicio?: string | null
          titulo?: string | null
        }
        Update: {
          data_postagem?: string | null
          id?: number
          tags?: string | null
          texto_inicio?: string | null
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
          conhecimentoAyurveda: string | null
          created_at: string
          diagn: string | null
          doshaprincipal: string | null
          email: string | null
          espiritual: string | null
          id: string
          idade: number | null
          idPublico: string
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
          created_at?: string
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          id?: string
          idade?: number | null
          idPublico: string
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
          created_at?: string
          diagn?: string | null
          doshaprincipal?: string | null
          email?: string | null
          espiritual?: string | null
          id?: string
          idade?: number | null
          idPublico?: string
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
          vatascore?: number | null
        }
        Relationships: []
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
          vatascore?: number | null
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
      portal_glossario: {
        Row: {
          alimentosEvitar: string | null
          alimentosPriorizar: string | null
          atributos: string | null
          caminhosEquilibrio: string | null
          desequilibrio: string | null
          dicasGeraisFazer: string | null
          dicasGeraisNaoFazer: string | null
          doshaNome: string | null
          equilibrio: string | null
          id: number
          oque: string | null
          principaisCausas: string | null
          principaisDoencas: string | null
          rotinasEquilibrar: string | null
          rotinasInadequadas: string | null
          Title: string | null
        }
        Insert: {
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          desequilibrio?: string | null
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshaNome?: string | null
          equilibrio?: string | null
          id: number
          oque?: string | null
          principaisCausas?: string | null
          principaisDoencas?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
          Title?: string | null
        }
        Update: {
          alimentosEvitar?: string | null
          alimentosPriorizar?: string | null
          atributos?: string | null
          caminhosEquilibrio?: string | null
          desequilibrio?: string | null
          dicasGeraisFazer?: string | null
          dicasGeraisNaoFazer?: string | null
          doshaNome?: string | null
          equilibrio?: string | null
          id?: number
          oque?: string | null
          principaisCausas?: string | null
          principaisDoencas?: string | null
          rotinasEquilibrar?: string | null
          rotinasInadequadas?: string | null
          Title?: string | null
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
      samkhya: {
        Row: {
          content: string | null
          "Efeitos esperados": string | null
          embedding: string | null
          id: number
          Indicações: string | null
          Ingredientes: string | null
          "O que é": string | null
          "Outros/curiosidade": string | null
          Posologia: string | null
          Produto: string | null
        }
        Insert: {
          content?: string | null
          "Efeitos esperados"?: string | null
          embedding?: string | null
          id?: number
          Indicações?: string | null
          Ingredientes?: string | null
          "O que é"?: string | null
          "Outros/curiosidade"?: string | null
          Posologia?: string | null
          Produto?: string | null
        }
        Update: {
          content?: string | null
          "Efeitos esperados"?: string | null
          embedding?: string | null
          id?: number
          Indicações?: string | null
          Ingredientes?: string | null
          "O que é"?: string | null
          "Outros/curiosidade"?: string | null
          Posologia?: string | null
          Produto?: string | null
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
          tag?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: { Args: { data: string }; Returns: string }
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
      text_to_bytea: { Args: { data: string }; Returns: string }
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
