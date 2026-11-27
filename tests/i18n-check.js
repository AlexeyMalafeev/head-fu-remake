// Verify catalog coverage, saved language and translation before wrapping/typewriter animation.
(function () {
  'use strict';
  function check(ok, message) { if (!ok) throw new Error(message); }
  HF.setLanguage('ru');
  const source = [];
  for (const f of HF.FIGHTERS) source.push(f.name, f.title, f.abilityName, f.abilityDesc, ...f.quotes);
  for (const stage of HF.STAGES) source.push(stage.name);
  const scripts = [];
  for (const fighter of HF.FIGHTERS) {
    const route = HF.STORIES[fighter.id];
    check(route && route.chapters.length >= 4, fighter.name + ' needs a story with at least four fights');
    source.push(route.title, route.retry, route.epilogue);
    scripts.push(route.intro, route.ending);
    for (const c of route.chapters) scripts.push({ lines: c.pre }, { lines: c.post });
  }
  source.push('Choose a fighter and play their story.', 'Pick a fighter with a story', 'TAP TO ADVANCE');
  for (const script of scripts) {
    for (const line of script.lines) {
      source.push(line.text);
      const originalText = line.text;
      const dialog = new HF.DialogScene({ lines: [line] }, () => {});
      check(dialog.lines[0].text === HF.t(line.text), 'Dialogue must translate before revealing letters');
      check(line.text === originalText, 'Source dialogue stays intact');
    }
  }
  for (const text of source) {
    check(Object.prototype.hasOwnProperty.call(HF.translations.ru, text), 'Missing translation: ' + text);
    check(HF.t(text) !== text || !/[a-z]/i.test(text), 'Untranslated text: ' + text);
  }
  check(HF.t('PLAYER {n} WINS!', { n: 2 }) === 'ИГРОК 2 ПОБЕДИЛ!', 'Player winner template');
  check(HF.t('{name} WINS', { name: HF.t('KENJI') }) === 'ПОБЕДИТЕЛЬ: КЭНДЗИ', 'Fighter winner template');
  const ctx = { measureText: (text) => ({ width: text.length * 8 }) };
  const wrapped = HF.U.wrap(ctx, HF.FIGHTERS[0].abilityDesc, 120);
  check(wrapped.join(' ') === HF.t(HF.FIGHTERS[0].abilityDesc), 'Translate before wrapping');
  check(HF.U.font(20).includes('Russo One'), 'Cyrillic heading font');
  check(HF.U.font(20, false).includes('Nunito'), 'Cyrillic body font');
  check(JSON.parse(localStorage.getItem('headfu.settings')).language === 'ru', 'Language is saved');
  const saved = JSON.parse(localStorage.getItem('headfu.settings'));
  check(saved.rounds === 3 && saved.music === 0.6, 'Existing settings are preserved');
  HF.setLanguage('en');
  for (const text of source) check(HF.t(text) === text, 'English changed: ' + text);
  HF.setLanguage('invalid');
  check(HF.settings.language === 'en', 'Unknown languages fall back to English');
  print('i18n OK: ' + source.length + ' roster, stage and story texts; templates, wrapping, fonts and saved settings');
})();
