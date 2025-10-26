/**
 * Facebook Dataset Quality API
 * Monitoramento e otimização da qualidade dos dados
 * Documentação: https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api/
 */

// Configurações da Dataset Quality API
const DATASET_QUALITY_CONFIG = {
  accessToken: 'EAANkKHKItxEBPpQkG4rajBf4b6wBZCS7iVKzPjCHRlKXdGGr1Hj4kkdxPX8oRgUvxC2ZCowtOgAzsr6qagWmLn0JRcWZAfpVGB7nVjmEkX4iYKLLoh7AHLK8WSzF0HMousmivQws8eLGwOwLTdy4pgST6W1rPPQwrzpyx9PJQYZBhlAomHjkiL6Y1X7aQjnn5QZDZD',
  pixelId: '1085353383617030',
  apiUrl: 'https://graph.facebook.com/v23.0',
  agentName: 'olympikus_outubro_rosa_2025', // Nome do agente para filtrar eventos
  refreshInterval: 300000, // 5 minutos
  enableAutoRefresh: true
};

/**
 * Classe principal para Dataset Quality API
 */
class FacebookDatasetQuality {
  constructor(config = DATASET_QUALITY_CONFIG) {
    this.config = config;
    this.qualityData = null;
    this.lastUpdate = null;
    this.autoRefreshInterval = null;
    
    // Inicializar monitoramento automático
    if (config.enableAutoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Obter dados de qualidade do dataset
   */
  async getDatasetQuality(fields = null) {
    try {
      const defaultFields = [
        'web{event_match_quality{percentage,description},event_name}',
        'web{acr{percentage,description},event_name}',
        'web{data_freshness{upload_frequency,description},event_name}',
        'web{event_deduplication{percentage,description},event_name}',
        'web{event_coverage{percentage,description},event_name}',
        'web{dedupe_key_feedback{dedupe_key,browser_events_with_dedupe_key{percentage,description},server_events_with_dedupe_key{percentage,description},overall_browser_coverage_from_dedupe_key{percentage,description}},event_name}',
        'web{event_potential_aly_acr_increase{percentage,description},event_name}'
      ];

      const fieldsParam = fields || defaultFields.join(',');
      
      const url = new URL(`${this.config.apiUrl}/dataset_quality`);
      url.searchParams.append('dataset_id', this.config.pixelId);
      url.searchParams.append('access_token', this.config.accessToken);
      url.searchParams.append('fields', fieldsParam);
      
      if (this.config.agentName) {
        url.searchParams.append('agent_name', this.config.agentName);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.qualityData = data;
        this.lastUpdate = new Date();
        console.log('Dataset Quality API - Dados obtidos com sucesso:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('Dataset Quality API - Erro:', response.status, errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Dataset Quality API - Erro ao obter dados:', error);
      throw error;
    }
  }

  /**
   * Obter Event Match Quality (EMQ) para eventos específicos
   */
  async getEventMatchQuality(eventNames = null) {
    try {
      const fields = 'web{event_match_quality{percentage,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Event Match Quality:', error);
      throw error;
    }
  }

  /**
   * Obter Additional Conversions Reported (ACR)
   */
  async getAdditionalConversionsReported(eventNames = null) {
    try {
      const fields = 'web{acr{percentage,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter ACR:', error);
      throw error;
    }
  }

  /**
   * Obter Data Freshness
   */
  async getDataFreshness(eventNames = null) {
    try {
      const fields = 'web{data_freshness{upload_frequency,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Data Freshness:', error);
      throw error;
    }
  }

  /**
   * Obter Event Deduplication
   */
  async getEventDeduplication(eventNames = null) {
    try {
      const fields = 'web{event_deduplication{percentage,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Event Deduplication:', error);
      throw error;
    }
  }

  /**
   * Obter Event Coverage
   */
  async getEventCoverage(eventNames = null) {
    try {
      const fields = 'web{event_coverage{percentage,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Event Coverage:', error);
      throw error;
    }
  }

  /**
   * Obter Dedupe Key Feedback
   */
  async getDedupeKeyFeedback(eventNames = null) {
    try {
      const fields = 'web{dedupe_key_feedback{dedupe_key,browser_events_with_dedupe_key{percentage,description},server_events_with_dedupe_key{percentage,description},overall_browser_coverage_from_dedupe_key{percentage,description}},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Dedupe Key Feedback:', error);
      throw error;
    }
  }

  /**
   * Obter Potential ACR Increase
   */
  async getPotentialACRIncrease(eventNames = null) {
    try {
      const fields = 'web{event_potential_aly_acr_increase{percentage,description},event_name}';
      const data = await this.getDatasetQuality(fields);
      
      if (eventNames) {
        return data.web.filter(event => eventNames.includes(event.event_name));
      }
      
      return data.web;
    } catch (error) {
      console.error('Erro ao obter Potential ACR Increase:', error);
      throw error;
    }
  }

  /**
   * Analisar qualidade geral do dataset
   */
  async analyzeDatasetQuality() {
    try {
      const data = await this.getDatasetQuality();
      const analysis = {
        timestamp: new Date(),
        overallScore: 0,
        events: [],
        recommendations: [],
        alerts: []
      };

      let totalScore = 0;
      let eventCount = 0;

      data.web.forEach(event => {
        const eventAnalysis = {
          eventName: event.event_name,
          emq: event.event_match_quality?.percentage || 0,
          acr: event.acr?.percentage || 0,
          dataFreshness: event.data_freshness?.upload_frequency || 'unknown',
          deduplication: event.event_deduplication?.percentage || 0,
          coverage: event.event_coverage?.percentage || 0,
          potentialACR: event.event_potential_aly_acr_increase?.percentage || 0
        };

        // Calcular score do evento (média ponderada)
        const eventScore = (
          (eventAnalysis.emq * 0.3) +
          (eventAnalysis.acr * 0.25) +
          (eventAnalysis.deduplication * 0.2) +
          (eventAnalysis.coverage * 0.15) +
          (Math.min(eventAnalysis.potentialACR, 100) * 0.1)
        );

        eventAnalysis.score = Math.round(eventScore);
        analysis.events.push(eventAnalysis);

        totalScore += eventScore;
        eventCount++;

        // Gerar recomendações
        if (eventAnalysis.emq < 70) {
          analysis.recommendations.push({
            type: 'warning',
            event: event.event_name,
            message: `Event Match Quality baixo (${eventAnalysis.emq}%). Considere melhorar os dados do usuário.`
          });
        }

        if (eventAnalysis.dataFreshness !== 'real_time') {
          analysis.recommendations.push({
            type: 'info',
            event: event.event_name,
            message: `Data Freshness: ${eventAnalysis.dataFreshness}. Considere enviar eventos em tempo real.`
          });
        }

        if (eventAnalysis.deduplication < 80) {
          analysis.recommendations.push({
            type: 'warning',
            event: event.event_name,
            message: `Deduplicação baixa (${eventAnalysis.deduplication}%). Verifique as chaves de deduplicação.`
          });
        }

        if (eventAnalysis.potentialACR > 20) {
          analysis.recommendations.push({
            type: 'success',
            event: event.event_name,
            message: `Potencial de ACR alto (${eventAnalysis.potentialACR}%). Continue otimizando!`
          });
        }
      });

      analysis.overallScore = eventCount > 0 ? Math.round(totalScore / eventCount) : 0;

      // Gerar alertas baseados no score geral
      if (analysis.overallScore < 60) {
        analysis.alerts.push({
          type: 'critical',
          message: 'Score geral baixo. Ação imediata necessária.'
        });
      } else if (analysis.overallScore < 80) {
        analysis.alerts.push({
          type: 'warning',
          message: 'Score geral moderado. Considere otimizações.'
        });
      } else {
        analysis.alerts.push({
          type: 'success',
          message: 'Score geral excelente!'
        });
      }

      return analysis;
    } catch (error) {
      console.error('Erro ao analisar qualidade do dataset:', error);
      throw error;
    }
  }

  /**
   * Iniciar monitoramento automático
   */
  startAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }

    this.autoRefreshInterval = setInterval(async () => {
      try {
        await this.analyzeDatasetQuality();
        console.log('Dataset Quality - Monitoramento automático executado');
      } catch (error) {
        console.error('Dataset Quality - Erro no monitoramento automático:', error);
      }
    }, this.config.refreshInterval);
  }

  /**
   * Parar monitoramento automático
   */
  stopAutoRefresh() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = null;
    }
  }

  /**
   * Obter relatório completo
   */
  async getFullReport() {
    try {
      const analysis = await this.analyzeDatasetQuality();
      
      const report = {
        metadata: {
          pixelId: this.config.pixelId,
          agentName: this.config.agentName,
          lastUpdate: this.lastUpdate,
          generatedAt: new Date()
        },
        summary: {
          overallScore: analysis.overallScore,
          totalEvents: analysis.events.length,
          recommendations: analysis.recommendations.length,
          alerts: analysis.alerts.length
        },
        analysis: analysis,
        rawData: this.qualityData
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório completo:', error);
      throw error;
    }
  }

  /**
   * Exportar dados para CSV
   */
  exportToCSV(data) {
    if (!data || !data.web) {
      throw new Error('Dados inválidos para exportação');
    }

    const headers = [
      'Event Name',
      'Event Match Quality (%)',
      'ACR (%)',
      'Data Freshness',
      'Deduplication (%)',
      'Coverage (%)',
      'Potential ACR (%)'
    ];

    const rows = data.web.map(event => [
      event.event_name || '',
      event.event_match_quality?.percentage || 0,
      event.acr?.percentage || 0,
      event.data_freshness?.upload_frequency || '',
      event.event_deduplication?.percentage || 0,
      event.event_coverage?.percentage || 0,
      event.event_potential_aly_acr_increase?.percentage || 0
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

/**
 * Funções utilitárias para monitoramento
 */

// Função para criar dashboard simples
function createQualityDashboard(analysis) {
  const dashboard = document.createElement('div');
  dashboard.id = 'facebook-quality-dashboard';
  dashboard.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 12px;
  `;

  dashboard.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #1877f2;">Facebook Dataset Quality</h3>
    <div style="margin-bottom: 10px;">
      <strong>Score Geral:</strong> 
      <span style="color: ${analysis.overallScore >= 80 ? 'green' : analysis.overallScore >= 60 ? 'orange' : 'red'};">
        ${analysis.overallScore}%
      </span>
    </div>
    <div style="margin-bottom: 10px;">
      <strong>Eventos:</strong> ${analysis.events.length}
    </div>
    <div style="margin-bottom: 10px;">
      <strong>Recomendações:</strong> ${analysis.recommendations.length}
    </div>
    <div style="margin-bottom: 10px;">
      <strong>Última Atualização:</strong> ${analysis.timestamp.toLocaleTimeString()}
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #1877f2;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    ">Fechar</button>
  `;

  document.body.appendChild(dashboard);
  return dashboard;
}

// Função para log de qualidade
function logQualityMetrics(analysis) {
  console.group('📊 Facebook Dataset Quality Report');
  console.log(`Score Geral: ${analysis.overallScore}%`);
  console.log(`Total de Eventos: ${analysis.events.length}`);
  
  analysis.events.forEach(event => {
    console.log(`\n📈 ${event.eventName}:`);
    console.log(`  EMQ: ${event.emq}%`);
    console.log(`  ACR: ${event.acr}%`);
    console.log(`  Data Freshness: ${event.dataFreshness}`);
    console.log(`  Deduplication: ${event.deduplication}%`);
    console.log(`  Coverage: ${event.coverage}%`);
    console.log(`  Score: ${event.score}%`);
  });

  if (analysis.recommendations.length > 0) {
    console.log('\n💡 Recomendações:');
    analysis.recommendations.forEach(rec => {
      console.log(`  ${rec.type.toUpperCase()}: ${rec.message}`);
    });
  }

  if (analysis.alerts.length > 0) {
    console.log('\n🚨 Alertas:');
    analysis.alerts.forEach(alert => {
      console.log(`  ${alert.type.toUpperCase()}: ${alert.message}`);
    });
  }

  console.groupEnd();
}

// Instância global
window.FacebookDatasetQuality = FacebookDatasetQuality;
window.createQualityDashboard = createQualityDashboard;
window.logQualityMetrics = logQualityMetrics;

// Inicializar automaticamente
const datasetQuality = new FacebookDatasetQuality();

// Função global para análise rápida
window.analyzeQuality = async () => {
  try {
    const analysis = await datasetQuality.analyzeDatasetQuality();
    logQualityMetrics(analysis);
    return analysis;
  } catch (error) {
    console.error('Erro na análise de qualidade:', error);
  }
};

// Função global para dashboard
window.showQualityDashboard = async () => {
  try {
    const analysis = await datasetQuality.analyzeDatasetQuality();
    createQualityDashboard(analysis);
    return analysis;
  } catch (error) {
    console.error('Erro ao criar dashboard:', error);
  }
};

console.log('Facebook Dataset Quality API carregada com sucesso!');
console.log('Use analyzeQuality() para análise rápida ou showQualityDashboard() para dashboard visual');
