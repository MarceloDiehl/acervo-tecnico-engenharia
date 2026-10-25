/*
 * Motor de telas do Acervo Técnico de Engenharia
 * JavaScript puro (sem React e sem dependências).
 *
 * - Lê o modelo de tela (<script type="text/x-template" id="tela">) com marcações simples:
 *     {{caminho}}                       valor (texto ou atributo)
 *     <sc-if value="{{cond}}">…</sc-if>   bloco condicional
 *     <sc-for list="{{lista}}" as="x">…</sc-for>   repetição
 *     onClick="{{fn}}" onChange="{{fn}}" …         eventos
 * - Gera o HTML a partir do estado da aplicação (classe Component, em acervo.js)
 * - Atualiza o DOM só onde mudou (preserva foco, cursor, rolagem e animações).
 */
(function (global) {
  'use strict';

  /* ---------- modelo: compila uma vez ---------- */
  function compilar(t) {
    var pos = 0;
    function lerBloco(fim) {
      var partes = [];
      var re = /<(sc-if|sc-for)\b([^>]*)>|<\/(sc-if|sc-for)>/g;
      while (true) {
        re.lastIndex = pos;
        var m = re.exec(t);
        if (!m) { partes.push.apply(partes, texto(t.slice(pos))); pos = t.length; return partes; }
        partes.push.apply(partes, texto(t.slice(pos, m.index)));
        pos = re.lastIndex;
        if (m[3]) { return partes; } /* fechamento */
        var attrs = m[2];
        var cam = function (nome) { var r = new RegExp(nome + '="\\{\\{\\s*([^}]+?)\\s*\\}\\}"').exec(attrs); return r ? r[1] : ''; };
        if (m[1] === 'sc-if') partes.push({ t: 'se', c: cam('value'), f: lerBloco() });
        else partes.push({ t: 'para', c: cam('list'), como: (/as="([^"]+)"/.exec(attrs) || [])[1], f: lerBloco() });
      }
    }
    var dentroTag = false;
    function texto(s) {
      var out = [];
      var re = /\{\{\s*([^}]+?)\s*\}\}/g, last = 0, m;
      while ((m = re.exec(s))) {
        var lit = s.slice(last, m.index);
        dentroTag = varrer(lit, dentroTag);
        if (lit) out.push({ t: 'lit', s: lit });
        out.push({ t: 'val', c: m[1], attr: dentroTag });
        last = re.lastIndex;
      }
      var resto = s.slice(last);
      dentroTag = varrer(resto, dentroTag);
      if (resto) out.push({ t: 'lit', s: resto });
      return out;
    }
    function varrer(s, estado) {
      for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        if (ch === '<' && /[a-zA-Z\/!]/.test(s[i + 1] || '')) estado = true;
        else if (ch === '>') estado = false;
      }
      return estado;
    }
    return lerBloco();
  }

  function pegar(ctx, caminho) {
    var ps = caminho.split('.');
    var v = ctx;
    for (var i = 0; i < ps.length; i++) { if (v == null) return undefined; v = v[ps[i]]; }
    return v;
  }
  function esc(v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function gerar(partes, ctx, reg) {
    var out = '';
    for (var i = 0; i < partes.length; i++) {
      var p = partes[i];
      if (p.t === 'lit') out += p.s;
      else if (p.t === 'val') {
        var v = pegar(ctx, p.c);
        if (typeof v === 'function') { reg.push(v); out += 'ƒ' + (reg.length - 1); }
        else if (v == null) out += '';
        else if (typeof v === 'boolean') out += p.attr ? String(v) : '';
        else out += esc(v);
      } else if (p.t === 'se') { if (pegar(ctx, p.c)) out += gerar(p.f, ctx, reg); }
      else if (p.t === 'para') {
        var lista = pegar(ctx, p.c) || [];
        for (var j = 0; j < lista.length; j++) {
          var c2 = Object.create(ctx); c2[p.como] = lista[j];
          out += gerar(p.f, c2, reg);
        }
      }
    }
    return out;
  }

  var EVENTOS = { Click: 'click', DoubleClick: 'dblclick', Change: 'change', Input: 'change', KeyDown: 'keydown', DragOver: 'dragover', Drop: 'drop', DragLeave: 'dragleave', Focus: 'focus', Blur: 'blur', MouseDown: 'mousedown' };
  var BOOLEANOS = 'disabled|checked|selected|readonly|hidden|required|multiple|autofocus|open';

  function posProcessar(html) {
    html = html.replace(/\son([A-Z][a-zA-Z]*)="ƒ(\d+)"/g, function (_, nome, id) { return ' data-on-' + (EVENTOS[nome] || nome.toLowerCase()) + '="' + id + '"'; });
    html = html.replace(new RegExp('\\s(' + BOOLEANOS + ')="([^"]*)"', 'g'), function (_, nome, v) { return /^(false|null|undefined|0|)$/.test(v) ? '' : ' ' + nome; });
    html = html.replace(/<textarea\b([^>]*?)\svalue="([^"]*)"([^>]*)><\/textarea>/g, '<textarea$1$3>$2</textarea>');
    html = html.replace(/<select\b([^>]*)>([\s\S]*?)<\/select>/g, function (all, attrs, corpo) {
      var m = /\svalue="([^"]*)"/.exec(attrs);
      if (!m) return all;
      var alvo = m[1];
      attrs = attrs.replace(m[0], '');
      var marcado = false;
      corpo = corpo.replace(/<option\b([^>]*)>/g, function (o, a) {
        a = a.replace(/\sselected\b/g, '');
        var mv = /\svalue="([^"]*)"/.exec(a);
        if (!marcado && mv && mv[1] === alvo) { marcado = true; return '<option' + a + ' selected>'; }
        return '<option' + a + '>';
      });
      return '<select' + attrs + ' data-valor="' + alvo + '">' + corpo + '</select>';
    });
    return html;
  }

  /* ---------- atualização do DOM ---------- */
  function mesmoTipo(a, b) { return a.nodeType === b.nodeType && (a.nodeType !== 1 || a.tagName === b.tagName); }
  function sincronizar(a, b) {
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    var i, at;
    for (i = a.attributes.length - 1; i >= 0; i--) { at = a.attributes[i].name; if (!b.hasAttribute(at)) a.removeAttribute(at); }
    for (i = 0; i < b.attributes.length; i++) { at = b.attributes[i]; if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value); }
    var tag = a.tagName;
    if (tag === 'TEXTAREA') { var tv = b.value; if (a.value !== tv) a.value = tv; return; }
    filhos(a, b);
    if (tag === 'INPUT') {
      if (a.type === 'checkbox' || a.type === 'radio') a.checked = b.hasAttribute('checked');
      else if (a.type !== 'file') { var v = b.getAttribute('value') || ''; if (a.value !== v) a.value = v; }
    } else if (tag === 'SELECT') {
      var alvo = b.getAttribute('data-valor');
      if (alvo !== null && a.value !== alvo) a.value = alvo;
    }
  }
  function filhos(a, b) {
    var ca = a.firstChild, cb = b.firstChild;
    while (cb) {
      var prox = cb.nextSibling;
      if (!ca) { a.appendChild(cb); }
      else if (mesmoTipo(ca, cb)) { sincronizar(ca, cb); ca = ca.nextSibling; }
      else { var proxA = ca.nextSibling; a.replaceChild(cb, ca); ca = proxA; }
      cb = prox;
    }
    while (ca) { var n = ca.nextSibling; a.removeChild(ca); ca = n; }
  }

  /* ---------- eventos (delegação, borbulhando como no navegador) ---------- */
  function ligarEventos(raiz, app) {
    function despachar(tipoAttr, e) {
      var el = e.target, parar = false;
      while (el && el !== raiz.parentNode) {
        if (el.nodeType === 1 && el.hasAttribute && el.hasAttribute('data-on-' + tipoAttr)) {
          var fn = app.registro[+el.getAttribute('data-on-' + tipoAttr)];
          if (fn) {
            var alvoAtual = el;
            var ev = new Proxy(e, { get: function (t, p) {
              if (p === 'currentTarget') return alvoAtual;
              if (p === 'stopPropagation') return function () { parar = true; t.stopPropagation(); };
              var v = t[p]; return typeof v === 'function' ? v.bind(t) : v;
            } });
            try { fn(ev); } catch (err) { console.error(err); }
            if (parar) break;
          }
        }
        el = el.parentNode;
      }
    }
    function campoDeTexto(t) {
      if (!t || !t.tagName) return false;
      if (t.tagName === 'TEXTAREA') return true;
      if (t.tagName !== 'INPUT') return false;
      return !/^(checkbox|radio|file)$/.test(t.type);
    }
    raiz.addEventListener('click', function (e) { despachar('click', e); });
    raiz.addEventListener('dblclick', function (e) { despachar('dblclick', e); });
    raiz.addEventListener('mousedown', function (e) { despachar('mousedown', e); });
    raiz.addEventListener('keydown', function (e) { despachar('keydown', e); });
    raiz.addEventListener('dragover', function (e) { despachar('dragover', e); });
    raiz.addEventListener('dragleave', function (e) { despachar('dragleave', e); });
    raiz.addEventListener('drop', function (e) { despachar('drop', e); });
    raiz.addEventListener('focusin', function (e) { despachar('focus', e); });
    raiz.addEventListener('focusout', function (e) { despachar('blur', e); });
    /* onChange: campos de texto reagem a cada tecla; select, checkbox e arquivo, à mudança */
    raiz.addEventListener('input', function (e) { if (campoDeTexto(e.target)) despachar('change', e); });
    raiz.addEventListener('change', function (e) { if (!campoDeTexto(e.target)) despachar('change', e); });
  }

  /* ---------- base dos componentes ---------- */
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (o) {
    var novo = typeof o === 'function' ? o(this.state, this.props) : o;
    if (novo) Object.assign(this.state, novo);
    if (this.__app) this.__app.agendar();
  };

  function montar(raiz, modeloTexto, Classe, props) {
    var app = { registro: [], pendente: false };
    var modelo = compilar(modeloTexto);
    var comp = new Classe(props || {});
    comp.__app = app;
    app.desenhar = function () {
      app.pendente = false;
      var reg = [];
      var html;
      try { html = posProcessar(gerar(modelo, comp.renderVals(), reg)); }
      catch (err) { console.error(err); return; }
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      filhos(raiz, tmp);
      app.registro = reg;
    };
    app.agendar = function () {
      if (app.pendente) return;
      app.pendente = true;
      (global.queueMicrotask || function (f) { Promise.resolve().then(f); })(app.desenhar);
    };
    ligarEventos(raiz, app);
    app.desenhar();
    if (comp.componentDidMount) comp.componentDidMount();
    global.addEventListener('pagehide', function () { if (comp.componentWillUnmount) comp.componentWillUnmount(); });
    return comp;
  }

  global.DCLogic = DCLogic;
  global.Motor = { montar: montar, compilar: compilar };
})(window);
