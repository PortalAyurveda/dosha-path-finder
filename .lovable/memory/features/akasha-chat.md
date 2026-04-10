---
name: Akasha IA Chat
description: AI chatbot page at /akasha with n8n webhook integration, user context from doshas_registros2
type: feature
---
- Webhook: POST https://n8n.portalayurveda.com/webhook/chat-ayurveda
- History: { action: "get_history", session_id: email_or_id }
- Messages: full payload with dosha scores, agni, imc, nome, email, contactId
- Response field: data.resposta || data.output || data.text
- User context loaded from doshas_registros2 via idPublico query param
- Fallback: anonymous visitor with localStorage visitorId
- Color: --akasha (280 30% 56%) / #9b73ad
- Logo: https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png
- Only visible in Header when user is on /meu-dosha?id= or /akasha
- MeuDosha footer: Akasha CTA (prominent) + Refazer Teste (no more biblioteca/compartilhar links)
