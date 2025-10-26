/**
 * Facebook Conversions API
 * Configuração completa para envio de eventos via API
 */

// Configurações da API
const FACEBOOK_CONFIG = {
  accessToken: 'YOUR_FACEBOOK_ACCESS_TOKEN', // Substitua pelo seu token
  pixelId: '1085353383617030',
  apiUrl: 'https://graph.facebook.com/v18.0',
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
  // Em um ambiente real, você coletaria esses dados do usuário
  return {
    client_ip_address: '', // Será preenchido pelo servidor
    client_user_agent: navigator.userAgent,
    fbc: getCookie('_fbc'), // Facebook click ID
    fbp: getCookie('_fbp'), // Facebook browser ID
    em: '', // Email hash (se disponível)
    ph: '', // Phone hash (se disponível)
    fn: '', // First name hash (se disponível)
    ln: '', // Last name hash (se disponível)
    ct: '', // City hash (se disponível)
    st: '', // State hash (se disponível)
    zp: '', // Zip code hash (se disponível)
    country: 'BR',
    external_id: '' // ID externo do usuário (se disponível)
  };
}

/**
 * Função para obter cookie
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

/**
 * Função para enviar evento para Facebook Conversions API
 */
async function sendFacebookEvent(eventName, eventData = {}) {
  try {
    const userData = getUserData();
    const eventId = eventData.event_id || generateEventId();
    
    const event = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_name: eventData.content_name || '',
        content_category: eventData.content_category || '',
        content_brand: eventData.content_brand || '',
        content_ids: eventData.content_ids || [],
        value: eventData.value || 0,
        currency: eventData.currency || 'BRL',
        order_id: eventData.order_id || '',
        num_items: eventData.num_items || 1
      }
    };

    const payload = {
      data: [event],
      test_event_code: FACEBOOK_CONFIG.testMode ? 'TEST12345' : undefined
    };

    const response = await fetch(`${FACEBOOK_CONFIG.apiUrl}/${FACEBOOK_CONFIG.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FACEBOOK_CONFIG.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Facebook Conversions API - Evento enviado:', eventName, result);
      return result;
    } else {
      console.error('Facebook Conversions API - Erro:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Facebook Conversions API - Erro ao enviar evento:', error);
  }
}

/**
 * Funções específicas para cada tipo de evento
 */

// PageView
async function trackPageView(pageData = {}) {
  return await sendFacebookEvent('PageView', pageData);
}

// ViewContent
async function trackViewContent(contentData = {}) {
  return await sendFacebookEvent('ViewContent', contentData);
}

// AddToCart
async function trackAddToCart(cartData = {}) {
  return await sendFacebookEvent('AddToCart', cartData);
}

// InitiateCheckout
async function trackInitiateCheckout(checkoutData = {}) {
  return await sendFacebookEvent('InitiateCheckout', checkoutData);
}

// Purchase
async function trackPurchase(purchaseData = {}) {
  return await sendFacebookEvent('Purchase', purchaseData);
}

// Lead
async function trackLead(leadData = {}) {
  return await sendFacebookEvent('Lead', leadData);
}

// Eventos customizados
async function trackCustomEvent(eventName, customData = {}) {
  return await sendFacebookEvent(eventName, customData);
}

/**
 * Função para enviar eventos em lote (otimização)
 */
async function sendBatchEvents(events) {
  try {
    const userData = getUserData();
    
    const formattedEvents = events.map(event => ({
      event_name: event.event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id: event.event_id || generateEventId(),
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: userData,
      custom_data: event.custom_data || {}
    }));

    const payload = {
      data: formattedEvents,
      test_event_code: FACEBOOK_CONFIG.testMode ? 'TEST12345' : undefined
    };

    const response = await fetch(`${FACEBOOK_CONFIG.apiUrl}/${FACEBOOK_CONFIG.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FACEBOOK_CONFIG.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Facebook Conversions API - Eventos em lote enviados:', result);
      return result;
    } else {
      console.error('Facebook Conversions API - Erro no lote:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Facebook Conversions API - Erro ao enviar lote:', error);
  }
}

/**
 * Função para validar eventos
 */
async function validateEvent(eventName, eventData = {}) {
  try {
    const userData = getUserData();
    const eventId = generateEventId();
    
    const event = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: window.location.href,
      action_source: 'website',
      user_data: userData,
      custom_data: eventData
    };

    const payload = {
      data: [event],
      test_event_code: 'TEST12345' // Sempre usar código de teste para validação
    };

    const response = await fetch(`${FACEBOOK_CONFIG.apiUrl}/${FACEBOOK_CONFIG.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FACEBOOK_CONFIG.accessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Facebook Conversions API - Evento validado:', eventName, result);
      return result;
    } else {
      console.error('Facebook Conversions API - Erro na validação:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Facebook Conversions API - Erro ao validar evento:', error);
  }
}

// Exportar funções para uso global
window.FacebookConversionsAPI = {
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackLead,
  trackCustomEvent,
  sendBatchEvents,
  validateEvent,
  config: FACEBOOK_CONFIG
};

console.log('Facebook Conversions API carregada com sucesso!');
