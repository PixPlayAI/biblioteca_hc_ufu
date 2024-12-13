import nodemailer from 'nodemailer';

const getFormattedDateTime = () => {
  // Criar data no fuso horário local
  const now = new Date();

  // Ajustar para GMT-3 (Brasília)
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { scores, comment } = req.body;
    const timestamp = getFormattedDateTime();
    const subject = `📊 Nova Avaliação NPS - Assistente Digital HC-UFU ${timestamp}`;

    const htmlContent = `
      <div style="font-family:Arial, sans-serif; background-color:#f3f4f6; color:#213547; padding:20px;">
        <div style="background-color:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
          <!-- Cabeçalho -->
          <div style="background-color:#97BE53; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; font-size:1.5rem; margin:0;">
              📊 Nova Avaliação Recebida<br>
              <span style="font-size:1.2rem;">${timestamp}</span>
            </h1>
          </div>

          <!-- Conteúdo -->
          <div style="padding:20px; text-align:left;">
            <h2 style="color:#213547; margin-top:0;">Pontuações NPS:</h2>
            <div style="background-color:#f8fafc; padding:15px; border-radius:8px; margin:15px 0;">
              <p style="margin:10px 0;">
                <strong>🎯 Experiência Geral:</strong> ${scores.methodologySupport}/10
              </p>
              <p style="margin:10px 0;">
                <strong>💡 Facilidade de Uso:</strong> ${scores.clarity}/10
              </p>
              <p style="margin:10px 0;">
                <strong>📢 Probabilidade de Recomendação:</strong> ${scores.overall}/10
              </p>
            </div>

            <div style="margin-top:20px;">
              <h3 style="color:#213547;">💭 Comentários do Usuário:</h3>
              <p style="background-color:#f8fafc; padding:15px; border-radius:8px; margin-top:10px;">
                ${comment || 'Nenhum comentário fornecido'}
              </p>
            </div>

            <hr style="border:none; border-bottom:1px solid #e5e7eb; margin:20px 0;" />

            <p style="font-size:0.875rem; color:#64748b;">
              Esta avaliação foi enviada automaticamente pelo Assistente Digital de Perguntas de Pesquisa em Saúde.
              <br>Horário de Brasília (GMT-3)
            </p>
          </div>
        </div>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Biblioteca HC-UFU" <${process.env.GMAIL_USER}>`,
      to: 'franciscoestatistica@gmail.com',
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'NPS feedback sent successfully' });
  } catch (error) {
    console.error('Error sending NPS feedback:', error);
    res.status(500).json({
      message: 'Error sending NPS feedback',
      error: error.message || 'Unknown error',
    });
  }
}
