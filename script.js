// ===== Configuração =====
const PIX = {
  chave: '+5575988224505',      // chave Pix (celular) no formato exigido pelo BR Code
  exibir: '(75) 98822-4505',
  nome: 'INFUSE SOFTWARE',      // até 25 caracteres, sem acento
  cidade: 'FEIRA SANTANA',      // até 15 caracteres, sem acento
};

// Link direto de avaliação do Google Perfil da Empresa
const GOOGLE_AVALIACAO = 'https://g.page/r/Cd3Xs1AHxy3TEAI/review';

document.getElementById('lnk-google').href = GOOGLE_AVALIACAO;

// ===== BR Code (Pix copia e cola) =====
function campo(id, valor) {
  return id + String(valor.length).padStart(2, '0') + valor;
}

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function gerarPayload({ chave, nome, cidade }) {
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', chave);
  const base =
    campo('00', '01') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    campo('58', 'BR') +
    campo('59', nome.slice(0, 25)) +
    campo('60', cidade.slice(0, 15)) +
    campo('62', campo('05', '***')) +
    '6304';
  return base + crc16(base);
}

const payload = gerarPayload(PIX);

// ===== Modal =====
const modal = document.getElementById('modal-pix');
const qrBox = document.getElementById('qr');
let qrPronto = false;

function desenharQR() {
  if (qrPronto) return;
  if (typeof qrcode !== 'function') {
    qrBox.innerHTML = '<p style="color:#0C0C0C;font-size:.85rem;padding:20px">Não foi possível gerar o QR Code. Use o botão de copiar abaixo.</p>';
    return;
  }
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  qrPronto = true;
}

function abrir() {
  desenharQR();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('.modal-caixa').focus();
}

function fechar() {
  modal.hidden = true;
  document.body.style.overflow = '';
  document.getElementById('btn-pix').focus();
}

document.getElementById('chave-txt').textContent = PIX.exibir;
document.getElementById('btn-pix').addEventListener('click', abrir);
modal.querySelectorAll('[data-fechar]').forEach((el) => el.addEventListener('click', fechar));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) fechar();
});

// ===== Copiar =====
const toast = document.getElementById('toast');
let toastTimer;

function avisar(msg) {
  toast.textContent = msg;
  toast.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('on'), 2200);
}

async function copiar(texto, msg) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  avisar(msg);
}

document.getElementById('btn-copiar').addEventListener('click', () =>
  copiar(payload, 'Pix copia e cola copiado!')
);
document.getElementById('btn-copiar-chave').addEventListener('click', () =>
  copiar(PIX.chave, 'Chave Pix copiada!')
);

// ===== Vídeo de fundo: fica parado no poster para quem pede menos movimento =====
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const video = document.querySelector('.fundo-video');
  video.removeAttribute('autoplay');
  video.pause();
}
