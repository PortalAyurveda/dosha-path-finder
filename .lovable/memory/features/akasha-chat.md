---
name: Akasha IA Chat
description: AI chatbot embedded in /meu-dosha Akasha tab + standalone /akasha page, n8n webhook, first-message auto-send, token tracking
type: feature
---
- Webhook: POST https://n8n.portalayurveda.com/webhook/chat-ayurveda
- History: { action: "get_history", session_id: email_or_id }
- Messages: full payload with dosha scores, agni, imc, nome, email, contactId
- Response field: data.resposta || data.output || data.text
- User context loaded from doshas_registros via idPublico query param
- Fallback: anonymous visitor with localStorage visitorId
- Color: --akasha (280 30% 56%) / #9b73ad
- Logo: https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png
- Akasha is now a TAB inside /meu-dosha (not in Header left menu)
- Akasha ✨ button appears in Header RIGHT side (user area) for logged-in/dosha users
- Standalone /akasha page still exists for direct access
- First-message logic: checks chat_histories for existing history; if none, auto-sends intro message with user's name, dosha, age, IMC
- Token system: user_profiles.tokens_akasha (default 10), decremented per message
- MeuDosha tabs: Perfil | Métricas | Artigos | Vídeos | Akasha ✨
- Vídeos tab has toggle: [Gerais] (default) / [Personalizado ✨]
- Gerais: pulls from portal_{dosha} based on doshaprincipal (3 per dosha, 6 for bidoshic)
- Personalizado: searches portal_lives, portal_oficial, portal_receitas matching user symptoms (agravTags), with priority: title match > timestamp match
