import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTaskDescriptionVague,
  generateStructuredTaskTemplate,
  DEFAULT_BOILERPLATE_DESCRIPTION,
  GOLDEN_TASK_YOMNA_DESC
} from './taskDescriptionUtils';

test('isTaskDescriptionVague detects missing, boilerplate, or vague descriptions', () => {
  assert.equal(isTaskDescriptionVague(''), true);
  assert.equal(isTaskDescriptionVague(undefined), true);
  assert.equal(isTaskDescriptionVague(null), true);
  assert.equal(isTaskDescriptionVague('    '), true);
  assert.equal(isTaskDescriptionVague(DEFAULT_BOILERPLATE_DESCRIPTION), true);
  assert.equal(isTaskDescriptionVague('مهمة جديدة'), true);
  assert.equal(isTaskDescriptionVague('تاسك'), true);

  // Proper detailed descriptions should NOT be vague
  assert.equal(isTaskDescriptionVague('تصميم 5 بنرات إعلانية مع مراجعة النصوص وإرسالها للمدير'), false);
  assert.equal(isTaskDescriptionVague(GOLDEN_TASK_YOMNA_DESC), false);
});

test('generateStructuredTaskTemplate creates structured role breakdown', () => {
  const template = generateStructuredTaskTemplate({
    title: 'تصميم كفرات سوشيال',
    assigneeName: 'آية',
    reviewerName: 'يمنى',
    company: 'جولدن'
  });

  assert.ok(template.includes('📌 المطلوب بالتحديد'));
  assert.ok(template.includes('تصميم كفرات سوشيال'));
  assert.ok(template.includes('جولدن'));
  assert.ok(template.includes('دور المكلف بالتنفيذ (آية)'));
  assert.ok(template.includes('دور المراجع / المنسق (يمنى)'));
  assert.ok(template.includes('🎯 معايير الجودة وموعد التسليم'));
});

test('Golden task Yomna description clearly clarifies both Aya and Yomna roles', () => {
  assert.ok(GOLDEN_TASK_YOMNA_DESC.includes('آية (Aya)'));
  assert.ok(GOLDEN_TASK_YOMNA_DESC.includes('يمنى (Yomna)'));
  assert.ok(GOLDEN_TASK_YOMNA_DESC.includes('Amira'));
  assert.ok(GOLDEN_TASK_YOMNA_DESC.includes('جولدن للأغذية'));
});
