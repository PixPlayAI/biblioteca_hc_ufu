import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const { email, content } = req.body;

    // Ajuste no remetente e assunto
    const fromName = 'Biblioteca HC-UFU';
    const subject = '📊 Resultado da sua Pesquisa - Assistente Digital HC-UFU';

    // Montar o conteúdo HTML do email
    // Use a logo hospedada ou base64. Exemplo: <img src="https://via.placeholder.com/200" alt="Logo" style="max-width:150px;"/>
    // Substitua pelo link da logo assim que tiver um link final.
    const htmlContent = `
      <div style="font-family:Arial, sans-serif; background-color:#f3f4f6; color:#213547; padding:20px;">
        <div style="background-color:#ffffff; max-width:600px; margin:0 auto; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
          <div style="background-color:#3b82f6; padding:20px; text-align:center;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/CANVAS_LOGO.svg/512px-CANVAS_LOGO.svg.png" alt="Logo HC-UFU" style="max-width:120px; margin-bottom:10px;" />
            <h1 style="color:#ffffff; font-size:1.5rem; margin:0;">Assistente Digital HC-UFU</h1>
          </div>

          <div style="padding:20px; text-align:left; background-color:#ffffff;">
            <h2 style="margin-top:0; font-size:1.25rem; color:#213547;">${subject}</h2>
            <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />
            <div style="font-size:1rem; line-height:1.5;">
              ${content
                .split('\n')
                .map((line) => `<p style="margin-bottom:10px;">${line}</p>`)
                .join('')}
            </div>
            <hr style="border:none; border-bottom:1px solid #d1d5db; margin:20px 0;" />
            <p style="font-size:0.875rem; color:#6b7280; margin-top:10px;">
              Atenciosamente,<br/>
              <strong>Equipe Biblioteca HC-UFU</strong>
            </p>
          </div>

          <div style="background-color:#f9fafb; padding:20px; font-size:0.875rem; color:#374151;">
            <strong>Assistente Digital de Perguntas de Pesquisa em Saúde</strong><br/>
            Desenvolvido em parceria entre a <strong>📚 Biblioteca</strong> e a <strong>🔬 UGITS</strong> (Unidade de Gestão da Inovação Tecnológica em Saúde) do HC-UFU/Ebserh, este assistente utiliza inteligência artificial para auxiliar pesquisadores na formulação estruturada de suas questões de pesquisa, guiando desde a ideia inicial até a construção de uma pergunta robusta e bem fundamentada.
            <br/><br/>
            <strong>📚 Biblioteca & 🔬 UGITS do HC-UFU/Ebserh</strong><br/>
            🏢 HC-UFU, Endereço: Av. Pará, 1720 - Umuarama, Uberlândia - MG, 38405-320<br/>
            📍 Sala 15 – Alojamento de Plantonistas – Campus Umuarama<br/>
            ⏰ Segunda a sexta-feira, das 7h00 às 19h00<br/>
            📧 <a style="color:#3b82f6; text-decoration:none;" href="mailto:seb.hc-ufu@ebserh.gov.br">seb.hc-ufu@ebserh.gov.br</a><br/>
            📱 Telefone/WhatsApp: (34) 3218-2451
          </div>
        </div>
      </div>
    `;

    // Configurar o transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Configurar o email
    const mailOptions = {
      from: `"${fromName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: subject,
      text: content,
      html: htmlContent,
    };

    // Enviar o email
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
