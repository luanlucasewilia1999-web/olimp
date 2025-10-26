/**
 * Pinterest Conversions API
 * Configuração completa para envio de eventos via API
 */

// Configurações da API
const PINTEREST_CONFIG = {
  accessToken: 'pina_AIA2RFAWADUDEBIAGAADGD5AJ272PGIBAAAABKKEIEHEO2HXVBCZKN7TJQKIO6AJMSGSRENAUCG4QJ4MJB76OBA5SZ4MP2QA',
  adAccountId: '549769523521',
  apiUrl: 'https://api.pinterest.com/v5/ad_accounts',
  testMode: false // Mude para true para modo de teste
};

/**
 * Função para gerar hash SHA256
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Função para gerar event_id único
 */
function generateEventId() {
  return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Função para obter dados do usuário
 */
function getUserData() {
  // Em um ambiente real, você coletaria esses dados do formulário ou sessão
  return {
    client_ip_address: '', // Será preenchido pelo servidor
    client_user_agent: navigator.userAgent,
    // Outros dados seriam coletados do formulário de checkout
  };
}

/**
 * Função para enviar evento para Pinterest API
 */
async function sendPinterestEvent(eventData) {
  try {
    const url = `${PINTEREST_CONFIG.apiUrl}/${PINTEREST_CONFIG.adAccountId}/events${PINTEREST_CONFIG.testMode ? '?test=true' : ''}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINTEREST_CONFIG.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Pinterest API Response:', result);
    return result;
  } catch (error) {
    console.error('Erro ao enviar evento para Pinterest API:', error);
    throw error;
  }
}

/**
 * Função para criar evento de checkout
 */
async function createCheckoutEvent(orderData) {
  const eventId = orderData.eventId || generateEventId();
  const userData = getUserData();
  
  // Hash dos dados do usuário (em produção, você faria isso no servidor)
  const hashedEmail = orderData.email ? await sha256(orderData.email.toLowerCase()) : null;
  const hashedPhone = orderData.phone ? await sha256(orderData.phone.replace(/\D/g, '')) : null;
  
  const eventPayload = {
    data: [{
      event_name: 'checkout',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      opt_out: false,
      partner_name: 'olympikus-outubro-rosa',
      user_data: {
        ...userData,
        ...(hashedEmail && { em: [hashedEmail] }),
        ...(hashedPhone && { ph: [hashedPhone] })
      },
      custom_data: {
        currency: 'BRL',
        value: orderData.value || '89.90',
        content_ids: ['tenis-olympikus-outubro-rosa-01'],
        content_name: 'Tênis Olympikus Corre 4 CB Outubro Rosa',
        content_category: 'tenis',
        content_brand: 'Olympikus',
        contents: [{
          item_price: '89.90',
          quantity: 1
        }],
        num_items: 1,
        order_id: orderData.orderId || eventId
      }
    }]
  };

  return await sendPinterestEvent(eventPayload);
}

/**
 * Função para criar evento de add_to_cart
 */
async function createAddToCartEvent(productData) {
  const eventId = generateEventId();
  const userData = getUserData();
  
  const eventPayload = {
    data: [{
      event_name: 'add_to_cart',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      opt_out: false,
      partner_name: 'olympikus-outubro-rosa',
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: productData.value || '89.90',
        content_ids: ['tenis-olympikus-outubro-rosa-01'],
        content_name: 'Tênis Olympikus Corre 4 CB Outubro Rosa',
        content_category: 'tenis',
        content_brand: 'Olympikus',
        contents: [{
          item_price: '89.90',
          quantity: 1
        }],
        num_items: 1
      }
    }]
  };

  return await sendPinterestEvent(eventPayload);
}

/**
 * Função para criar evento de page_visit
 */
async function createPageVisitEvent(pageData) {
  const eventId = generateEventId();
  const userData = getUserData();
  
  const eventPayload = {
    data: [{
      event_name: 'page_visit',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      opt_out: false,
      partner_name: 'olympikus-outubro-rosa',
      user_data: userData,
      custom_data: {
        content_name: pageData.contentName || 'Página Olympikus Outubro Rosa',
        content_category: pageData.category || 'outubro-rosa',
        content_brand: 'Olympikus'
      }
    }]
  };

  return await sendPinterestEvent(eventPayload);
}

/**
 * Função para criar evento customizado
 */
async function createCustomEvent(eventName, customData) {
  const eventId = generateEventId();
  const userData = getUserData();
  
  const eventPayload = {
    data: [{
      event_name: 'custom',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      opt_out: false,
      partner_name: 'olympikus-outubro-rosa',
      user_data: userData,
      custom_data: {
        custom_event_name: eventName,
        ...customData
      }
    }]
  };

  return await sendPinterestEvent(eventPayload);
}

/**
 * Função para criar evento de lead
 */
async function createLeadEvent(leadData) {
  const eventId = generateEventId();
  const userData = getUserData();
  
  const eventPayload = {
    data: [{
      event_name: 'lead',
      action_source: 'web',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      opt_out: false,
      partner_name: 'olympikus-outubro-rosa',
      user_data: userData,
      custom_data: {
        lead_type: leadData.leadType || 'quiz_completion',
        value: leadData.value || '0',
        currency: 'BRL'
      }
    }]
  };

  return await sendPinterestEvent(eventPayload);
}

// Exportar funções para uso global
window.PinterestAPI = {
  createCheckoutEvent,
  createAddToCartEvent,
  createPageVisitEvent,
  createCustomEvent,
  createLeadEvent,
  sendPinterestEvent
};

// Eventos automáticos baseados na página
document.addEventListener('DOMContentLoaded', async function() {
  // Evitar chamadas da Conversions API no navegador em contextos sem servidor/CORS
  const isHttp = window.location.protocol.indexOf('http') === 0;
  if (!isHttp) {
    console.warn('Pinterest Conversions API: ignorando envio automático (contexto sem HTTP).');
    return;
  }
  try {
    const currentPage = window.location.pathname;
    if (currentPage.includes('checkout')) {
      await PinterestAPI.createPageVisitEvent({ contentName: 'Checkout - Tênis Olympikus Outubro Rosa', category: 'checkout' });
    } else if (currentPage.includes('produto')) {
      await PinterestAPI.createPageVisitEvent({ contentName: 'Produto - Tênis Olympikus Outubro Rosa', category: 'produto' });
    } else {
      await PinterestAPI.createPageVisitEvent({ contentName: 'Quiz Outubro Rosa - Olympikus', category: 'quiz' });
    }
  } catch (err) {
    console.warn('Pinterest Conversions API: envio automático ignorado (provável CORS).', err);
  }
});

console.log('Pinterest Conversions API carregado com sucesso!');
