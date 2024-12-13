// pages/api/send-email.js
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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, content, libraryHelp, libraryMessage } = req.body;
    const timestamp = getFormattedDateTime();

    const fromName = 'Biblioteca HC-UFU';
    const subject = `🔔📊 Resultado da sua Pesquisa - Assistente Digital do HC-UFU ${timestamp}`;

    // Se o usuário solicitou ajuda da biblioteca, adicionamos a mensagem e enviamos em CC
    let librarySection = '';
    let ccEmails = [];
    if (libraryHelp && libraryMessage.trim() !== '') {
      librarySection = `
        <h2 style="font-size:1.25rem; margin-top:0; color:#213547;"><strong>MENSAGEM PARA A BIBLIOTECA:</strong></h2>
        <div style="font-size:1rem; line-height:1.5; margin-bottom:20px;">
          <p style="margin-bottom:10px;"><strong>Mensagem do Usuário:</strong></p>
          <div style="margin-left:10px; padding:10px; border-left:3px solid #97BE53; background-color:#f0f4e4;">
            <p>${libraryMessage.replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
        <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />
      `;
      ccEmails.push('seb.hc-ufu@ebserh.gov.br');
    }

    const htmlContent = `
      <div style="font-family:Arial, sans-serif; background-color:#f3f4f6; color:#213547; padding:20px;">
        <div style="background-color:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
          <!-- Barra Superior Verde -->
          <div style="background-color:#97BE53; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; font-size:1.5rem; margin:0;">
              🔔📊 Segue o Resultado da sua Pesquisa:<br>
              <span style="font-size:1.2rem;">${timestamp}</span>
            </h1>
          </div>

          <!-- Conteúdo Principal -->
          <div style="padding:20px; text-align:left; background-color:#ffffff;">
            ${librarySection}

            <h2 style="font-size:1.25rem; margin-top:0; color:#213547;"><strong>HISTÓRICO DA CONSTRUÇÃO:</strong></h2>
            <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />
            <div style="font-size:1rem; line-height:1.5;">
              ${content
                .split('\n')
                .map((line) => `<p style="margin-bottom:10px;">${line}</p>`)
                .join('')}
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
              Desenvolvido em parceria entre a <strong>📚 Biblioteca</strong> e a <strong>🔬 UGITS</strong> (Unidade de Gestão da Inovação Tecnológica em Saúde) do HC-UFU/Ebserh, este assistente utiliza inteligência artificial para auxiliar pesquisadores na formulação estruturada de suas questões de pesquisa, guiando desde a ideia inicial até a construção de uma pergunta robusta e bem fundamentada.<br/><br/>
              <small style="color:#666;">Horário de Brasília (GMT-3)</small>
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
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      to: email,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      subject: subject,
      text:
        libraryHelp && libraryMessage.trim() !== ''
          ? `MENSAGEM PARA A BIBLIOTECA:\n${libraryMessage}\n\nHISTÓRICO DA CONSTRUÇÃO:\n${content}`
          : content,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Error sending email',
      error: error.message || 'Unknown error',
    });
  }
}
