/**
 * Teclado do celular aberto (copiado do CP Hub, E42).
 * - `body.kb-open` enquanto um campo de texto está em uso com o teclado aberto: a barra de baixo e o + somem.
 * - `--kb`: altura do teclado que fica por cima da página (0 quando o navegador já encolhe a tela),
 *   para a faixa de formatação do editor ficar colada em cima do teclado.
 */
const EDITAVEL = 'input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=range]):not([type=color]):not([type=file]), textarea, select, [contenteditable="true"]';

export function editavel(el: Element | null): boolean {
  return !!el && el.matches?.(EDITAVEL) === true;
}

export function iniciarTeclado() {
  if (typeof window === 'undefined' || !window.matchMedia?.('(pointer: coarse)').matches) return;
  const vv = window.visualViewport;
  let maior = window.innerHeight;
  const atualizar = () => {
    maior = Math.max(maior, window.innerHeight);
    const visivel = vv ? vv.height + vv.offsetTop : window.innerHeight;
    // Parte da tela coberta pelo teclado (quando o navegador não encolhe a página).
    const coberto = Math.max(0, Math.round(window.innerHeight - visivel));
    // Teclado aberto: a área visível ficou bem menor que a tela inteira.
    const aberto = maior - (vv ? vv.height : window.innerHeight) > 150;
    document.documentElement.style.setProperty('--kb', `${coberto}px`);
    document.body.classList.toggle('kb-open', aberto && editavel(document.activeElement));
  };
  vv?.addEventListener('resize', atualizar);
  vv?.addEventListener('scroll', atualizar);
  window.addEventListener('resize', atualizar);
  // Girou a tela: a medida da tela inteira muda.
  window.addEventListener('orientationchange', () => {
    maior = 0;
    window.setTimeout(atualizar, 300);
  });
  document.addEventListener('focusin', () => window.setTimeout(atualizar, 50));
  document.addEventListener('focusout', () => window.setTimeout(atualizar, 50));
}
