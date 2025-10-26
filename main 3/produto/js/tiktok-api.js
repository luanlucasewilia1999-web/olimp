/**
 * TikTok Events API
 * Configuração completa para envio de eventos via API
 */

// Configurações da TikTok Events API
const TIKTOK_CONFIG = {
  accessToken: 'f27be6ec4127a86da603cfda3b1168cf119247f3',
  pixelId: 'D3FKAD3C77UEJB9H7S20',
  apiUrl: 'https://business-api.tiktok.com/open_api/v1.3/event/track',
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
  return {
    ip: '', // Será preenchido pelo servidor
    user_agent: navigator.userAgent,
    ttclid: getCookie('ttclid'), // TikTok click ID
    ttp: getCookie('ttp'), // TikTok pixel ID
    email: '', // Email hash (se disponível)
    phone: '', // Phone hash (se disponível)
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
 * Função para enviar evento para TikTok Events API
 */
async function sendTikTokEvent(eventName, eventData = {}) {
  try {
    const userData = getUserData();
    const eventId = eventData.event_id || generateEventId();
    
    const event = {
      event: eventName,
      event_id: eventId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      context: {
        page: {
          url: window.location.href,
          referrer: document.referrer
        },
        user: {
          user_agent: userData.user_agent,
          ip: userData.ip,
          external_id: userData.external_id
        },
        ad: {
          ttclid: userData.ttclid,
          ttp: userData.ttp
        }
      },
      properties: {
        value: eventData.value || 0,
        currency: eventData.currency || 'BRL',
        event_id: eventId
      }
    };

    // Adicionar contents array para eventos de e-commerce
    if (eventData.contents && Array.isArray(eventData.contents)) {
      event.properties.contents = eventData.contents;
    } else if (eventData.content_id) {
      // Fallback para formato antigo
      event.properties.content_id = eventData.content_id;
      event.properties.content_type = eventData.content_type || '';
      event.properties.content_name = eventData.content_name || '';
    }

    // Adicionar parâmetros específicos por evento
    if (eventData.search_string) {
      event.properties.search_string = eventData.search_string;
    }

    const payload = {
      data: [event],
      partner_name: 'olympikus_outubro_rosa_2025',
      test_event_code: TIKTOK_CONFIG.testMode ? 'TEST12345' : undefined
    };

    const response = await fetch(TIKTOK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_CONFIG.accessToken
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('TikTok Events API - Evento enviado:', eventName, result);
      return result;
    } else {
      console.error('TikTok Events API - Erro:', response.status, await response.text());
    }
  } catch (error) {
    console.error('TikTok Events API - Erro ao enviar evento:', error);
  }
}

/**
 * Funções específicas para cada tipo de evento
 */

// ViewContent
async function trackViewContent(contentData = {}) {
  return await sendTikTokEvent('ViewContent', contentData);
}

// AddToWishlist
async function trackAddToWishlist(wishlistData = {}) {
  return await sendTikTokEvent('AddToWishlist', wishlistData);
}

// Search
async function trackSearch(searchData = {}) {
  return await sendTikTokEvent('Search', searchData);
}

// AddPaymentInfo
async function trackAddPaymentInfo(paymentData = {}) {
  return await sendTikTokEvent('AddPaymentInfo', paymentData);
}

// AddToCart
async function trackAddToCart(cartData = {}) {
  return await sendTikTokEvent('AddToCart', cartData);
}

// InitiateCheckout
async function trackInitiateCheckout(checkoutData = {}) {
  return await sendTikTokEvent('InitiateCheckout', checkoutData);
}

// PlaceAnOrder
async function trackPlaceAnOrder(orderData = {}) {
  return await sendTikTokEvent('PlaceAnOrder', orderData);
}

// CompleteRegistration
async function trackCompleteRegistration(registrationData = {}) {
  return await sendTikTokEvent('CompleteRegistration', registrationData);
}

// Purchase
async function trackPurchase(purchaseData = {}) {
  return await sendTikTokEvent('Purchase', purchaseData);
}

/**
 * Função para enviar eventos em lote (otimização)
 */
async function sendBatchEvents(events) {
  try {
    const formattedEvents = events.map(event => {
      const userData = getUserData();
      const eventId = generateEventId();
      
      return {
        event: event.event_name,
        event_id: eventId,
        timestamp: Math.floor(Date.now() / 1000).toString(),
        context: {
          page: {
            url: window.location.href,
            referrer: document.referrer
          },
          user: {
            user_agent: userData.user_agent,
            ip: userData.ip,
            external_id: userData.external_id
          },
          ad: {
            ttclid: userData.ttclid,
            ttp: userData.ttp
          }
        },
        properties: {
          value: event.value || 0,
          currency: event.currency || 'BRL',
          event_id: eventId,
          ...event.additional_properties
        }
      };

      // Adicionar contents array para eventos de e-commerce
      if (event.contents && Array.isArray(event.contents)) {
        formattedEvent.properties.contents = event.contents;
      } else if (event.content_id) {
        // Fallback para formato antigo
        formattedEvent.properties.content_id = event.content_id;
        formattedEvent.properties.content_type = event.content_type || '';
        formattedEvent.properties.content_name = event.content_name || '';
      }

      return formattedEvent;
    });

    const payload = {
      data: formattedEvents,
      partner_name: 'olympikus_outubro_rosa_2025',
      test_event_code: TIKTOK_CONFIG.testMode ? 'TEST12345' : undefined
    };

    const response = await fetch(TIKTOK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_CONFIG.accessToken
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('TikTok Events API - Eventos em lote enviados:', result);
      return result;
    } else {
      console.error('TikTok Events API - Erro no lote:', response.status, await response.text());
    }
  } catch (error) {
    console.error('TikTok Events API - Erro ao enviar lote:', error);
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
      event: eventName,
      event_id: eventId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      context: {
        page: {
          url: window.location.href,
          referrer: document.referrer
        },
        user: {
          user_agent: userData.user_agent,
          ip: userData.ip,
          external_id: userData.external_id
        },
        ad: {
          ttclid: userData.ttclid,
          ttp: userData.ttp
        }
      },
      properties: {
        value: eventData.value || 0,
        currency: eventData.currency || 'BRL',
        event_id: eventId
      }
    };

    // Adicionar contents array para eventos de e-commerce
    if (eventData.contents && Array.isArray(eventData.contents)) {
      event.properties.contents = eventData.contents;
    } else if (eventData.content_id) {
      // Fallback para formato antigo
      event.properties.content_id = eventData.content_id;
      event.properties.content_type = eventData.content_type || '';
      event.properties.content_name = eventData.content_name || '';
    }

    const payload = {
      data: [event],
      partner_name: 'olympikus_outubro_rosa_2025',
      test_event_code: 'TEST12345' // Sempre usar código de teste para validação
    };

    const response = await fetch(TIKTOK_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': TIKTOK_CONFIG.accessToken
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('TikTok Events API - Evento validado:', eventName, result);
      return result;
    } else {
      console.error('TikTok Events API - Erro na validação:', response.status, await response.text());
    }
  } catch (error) {
    console.error('TikTok Events API - Erro ao validar evento:', error);
  }
}

/**
 * Função para obter estatísticas de eventos
 */
async function getEventStats() {
  try {
    const response = await fetch(`https://business-api.tiktok.com/open_api/v1.3/event/stats?pixel_code=${TIKTOK_CONFIG.pixelId}`, {
      method: 'GET',
      headers: {
        'Access-Token': TIKTOK_CONFIG.accessToken
      }
    });

    if (response.ok) {
      const result = await response.json();
      console.log('TikTok Events API - Estatísticas:', result);
      return result;
    } else {
      console.error('TikTok Events API - Erro ao obter estatísticas:', response.status, await response.text());
    }
  } catch (error) {
    console.error('TikTok Events API - Erro ao obter estatísticas:', error);
  }
}

// Exportar funções para uso global
window.TikTokEventsAPI = {
  trackViewContent,
  trackAddToWishlist,
  trackSearch,
  trackAddPaymentInfo,
  trackAddToCart,
  trackInitiateCheckout,
  trackPlaceAnOrder,
  trackCompleteRegistration,
  trackPurchase,
  sendBatchEvents,
  validateEvent,
  getEventStats,
  config: TIKTOK_CONFIG
};

console.log('TikTok Events API carregada com sucesso!');
