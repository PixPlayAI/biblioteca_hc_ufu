// components/Footer.jsx

import PropTypes from 'prop-types';

const Footer = ({ isDark }) => (
  <footer className="mt-8 py-6 px-4 border-t border-gray-200 bg-background dark:bg-background">
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h3 className="text-xl font-bold text-blue-600">
              Assistente Digital de Perguntas de Pesquisa em Saúde
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Desenvolvido em parceria entre a <span className="font-bold">📚 Biblioteca</span> e a{' '}
            <span className="font-bold">🔬 UGITS</span>{' '}
            <span className="text-xs text-gray-500">
              (Unidade de Gestão da Inovação Tecnológica em Saúde)
            </span>{' '}
            do HC-UFU/Ebserh, este assistente utiliza inteligência artificial para auxiliar
            pesquisadores na formulação estruturada de suas questões de pesquisa, guiando desde a
            ideia inicial até a construção de uma pergunta robusta e bem fundamentada.
          </p>
        </div>
        <div className="text-center md:text-right text-gray-700">
          <div className="mb-4">
            <h4 className="font-bold mb-2">📚 Biblioteca &amp; 🔬 UGITS do HC-UFU/Ebserh</h4>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-blue-600">🏢 HC-UFU, Endereço:</span> Av. Pará, 1720 - Umuarama,
              Uberlândia - MG, 38405-320
            </p>
            <p>
              <span className="text-blue-600">📍 Local de Funcionamento:</span> Sala 15 – Alojamento
              de Plantonistas – Campus Umuarama
            </p>
            <p>
              <span className="text-blue-600">⏰ Horário:</span> Segunda a sexta-feira, das 7h00 às
              19h00
            </p>
            <div className="mt-2">
              <p>
                <span className="text-blue-600">📧 E-mail:</span>{' '}
                <a href="mailto:seb.hc-ufu@ebserh.gov.br" className="hover:underline">
                  seb.hc-ufu@ebserh.gov.br
                </a>
                <span className="text-blue-600">📱 Telefone/WhatsApp:</span>{' '}
                <a href="tel:+553432182451" className="hover:underline">
                  (34) 3218-2451
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

Footer.propTypes = {
  isDark: PropTypes.bool.isRequired,
};

export default Footer;
