import nodemailer from 'nodemailer';

const getFormattedDateTime = () => {
  const now = new Date();
  const brasiliaOffset = -3;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const brasiliaTime = new Date(utc + 3600000 * brasiliaOffset);

  const day = String(brasiliaTime.getDate()).padStart(2, '0');
  const month = String(brasiliaTime.getMonth() + 1).padStart(2, '0');
  const year = String(brasiliaTime.getFullYear()).slice(-2);
  const hours = String(brasiliaTime.getHours()).padStart(2, '0');
  const minutes = String(brasiliaTime.getMinutes()).padStart(2, '0');

  return `[${day}/${month}/${year} - ${hours}:${minutes}]`;
};

export default async function handler(req, res) {
  console.log('=== Início do processamento NPS ===');

  if (req.method !== 'POST') {
    console.log('Método inválido:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Body da requisição:', req.body);
    const { scores, comment, source } = req.body;

    // Validação dos dados recebidos
    if (!scores || !source) {
      console.error('Dados obrigatórios ausentes:', { scores, source });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const timestamp = getFormattedDateTime();
    console.log('Timestamp gerado:', timestamp);

    // Verificar variáveis de ambiente
    console.log('Verificando variáveis de ambiente:', {
      hasGmailUser: !!process.env.GMAIL_USER,
      hasGmailPass: !!process.env.GMAIL_APP_PASSWORD,
      gmailUser: process.env.GMAIL_USER, // apenas para debug, remover em produção
    });

    const fromName = 'Biblioteca HC-UFU';
    const subject = `📊 Nova Avaliação NPS - ${source?.type === 'forced' ? '[OBRIGATÓRIA]' : '[ESPONTÂNEA]'} - Assistente Digital HC-UFU ${timestamp}`;

    const htmlContent = `
      <div style="font-family:Arial, sans-serif; background-color:#f3f4f6; color:#213547; padding:20px;">
        <div style="background-color:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
          <!-- Barra Superior Verde -->
          <div style="background-color:#97BE53; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; font-size:1.5rem; margin:0;">
              📊 Nova Avaliação NPS Recebida<br>
              <span style="font-size:1.2rem;">${timestamp}</span>
            </h1>
          </div>

          <!-- Conteúdo Principal -->
          <div style="padding:20px; text-align:left; background-color:#ffffff;">
            <!-- Origem da Avaliação -->
            <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin:15px 0;">
              <h3 style="color:#213547; margin-top:0;">📍 Origem da Avaliação:</h3>
              <p style="margin:5px 0;">
                <strong>Botão de Origem:</strong> ${source?.text || 'Não especificado'}<br>
                <strong>Descrição:</strong> ${source?.description || 'Não especificada'}<br>
                <strong>Tipo de Envio:</strong> ${source?.type === 'forced' ? 'Obrigatório' : 'Espontâneo'}
              </p>
            </div>

            <!-- Pontuações -->
            <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin:15px 0;">
              <h3 style="color:#213547; margin-top:0;">🎯 Pontuações da Avaliação:</h3>
              <p style="margin:10px 0;">
                <strong>Suporte Metodológico:</strong> ${scores.methodologySupport}/10
                <br><small style="color:#666">Avaliação do suporte na estruturação da pergunta usando diferentes formatos (PICO, PICOT, etc.)</small>
              </p>
              <p style="margin:10px 0;">
                <strong>Clareza das Orientações:</strong> ${scores.clarity}/10
                <br><small style="color:#666">Avaliação da clareza e utilidade das orientações fornecidas</small>
              </p>
              <p style="margin:10px 0;">
                <strong>Probabilidade de Recomendação:</strong> ${scores.overall}/10
                <br><small style="color:#666">Probabilidade de recomendar o assistente para outros pesquisadores</small>
              </p>
            </div>

            <!-- Comentários -->
            <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin:15px 0;">
              <h3 style="color:#213547; margin-top:0;">💭 Comentários do Usuário:</h3>
              <p style="margin:5px 0;">${comment || 'Nenhum comentário fornecido'}</p>
            </div>

            <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />

            <p style="font-size:0.875rem; color:#213547; margin-top:10px;">
              Atenciosamente,<br/>
              <strong>Equipe Biblioteca HC-UFU</strong><br/>
              📚 Biblioteca & 🔬 UGITS do HC-UFU/Ebserh<br/>
              🏢 HC-UFU, Endereço: Av. Pará, 1720 - Umuarama, Uberlândia - MG, 38405-320<br/>
              📍 Sala 15 – Alojamento de Plantonistas – Campus Umuarama<br/>
              ⏰ Segunda a sexta-feira, das 7h00 às 19h00<br/>
              📧 <a style="color:#3b82f6; text-decoration:none;" href="mailto:seb.hc-ufu@ebserh.gov.br">seb.hc-ufu@ebserh.gov.br</a><br/>
              📱 Telefone/WhatsApp: (34) 3218-2451
            </p>

            <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />

            <p style="font-size:0.875rem; color:#374151; margin-top:10px; text-align: center;">
              <strong>Assistente Digital de Perguntas de Pesquisa em Saúde</strong><br/>
              Esta avaliação foi enviada automaticamente pelo sistema<br/>
              <small style="color:#666;">Horário de Brasília (GMT-3)</small>
            </p>
          </div>
        </div>
      </div>
    `;
    console.log('Configurando transportador de email');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('Verificando conexão com o servidor de email');
    await transporter.verify();
    console.log('Conexão com servidor de email OK');

    const mailOptions = {
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      to: 'franciscoestatistica@gmail.com', // Email fixo para receber as avaliações NPS
      subject,
      html: htmlContent,
    };

    console.log('Enviando email com opções:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso:', info);

    res.status(200).json({
      message: 'NPS feedback sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Erro completo ao enviar NPS:', {
      message: error.message,
      stack: error.stack,
      error,
    });

    res.status(500).json({
      message: 'Error sending NPS feedback',
      error: error.message,
      stack: error.stack,
      details: error,
    });
  }
}
