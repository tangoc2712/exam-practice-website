const fs = require('fs');
const path = require('path');

const RAW_DIR = '/tmp';
const OUT_DIR = path.join('src', 'data', 'exams');
const INDEX_FILE = path.join('src', 'data', 'exams-index.json');
const LEGACY_AGGREGATE_FILE = path.join('src', 'data', 'exams.json');

const TRACK_CONFIG = {
  de: {
    pattern: /^de_course_exam_.*\.json$/,
    idPrefix: 'gcp-de-practice-',
    titleLabel: 'Data Engineer',
    domain: 'Data Engineer Practice',
    filenamePrefix: 'gcp-de-practice-'
  },
  ml: {
    pattern: /^ml_course_exam_.*\.json$/,
    idPrefix: 'gcp-ml-practice-',
    titleLabel: 'Machine Learning Engineer',
    domain: 'Machine Learning Engineer Practice',
    filenamePrefix: 'gcp-ml-practice-'
  },
  db: {
    pattern: /^db_course_exam_.*\.json$/,
    idPrefix: 'gcp-db-practice-',
    titleLabel: 'Cloud Database Engineer',
    domain: 'Cloud Database Engineer Practice',
    filenamePrefix: 'gcp-db-practice-'
  }
};

function decodeCreditedFlag(base64Value) {
  try {
    const decoded = Buffer.from(base64Value || '', 'base64').toString('utf8');
    return decoded.includes('true');
  } catch {
    return false;
  }
}

function getOptionExplanation(choice, question, questionFallbackExplanation, optionPosition, choiceId) {
  const byChoiceField =
    choice.explanation ||
    choice.choice_explanation ||
    choice.text_explanation ||
    '';

  const byQuestionMap =
    (question.choice_explanations && (
      question.choice_explanations[choiceId] ||
      question.choice_explanations[String(choiceId)] ||
      question.choice_explanations[optionPosition]
    )) ||
    '';

  return byChoiceField || byQuestionMap || questionFallbackExplanation || '';
}

function parseExamPayload(data, track) {
  if (!data || !data.quiz || !Array.isArray(data.questions) || !Array.isArray(data.choices)) {
    return null;
  }

  const choicesById = new Map();
  for (const choice of data.choices) {
    choicesById.set(choice.id, {
      id: `o${choice.id}`,
      rawId: choice.id,
      position: choice.position,
      text: choice.text || '',
      isCorrect: decodeCreditedFlag(choice.credited),
      choice
    });
  }

  const questions = data.questions.map((question) => {
    const questionExplanation = question.text_explanation || '';
    const resolvedChoices = (question.choice_ids || [])
      .map((choiceId) => choicesById.get(choiceId))
      .filter(Boolean);

    const options = resolvedChoices.map((resolvedChoice, optionIndex) => ({
      id: resolvedChoice.id,
      text: resolvedChoice.text,
      isCorrect: resolvedChoice.isCorrect,
      explanation: getOptionExplanation(
        resolvedChoice.choice,
        question,
        questionExplanation,
        resolvedChoice.position ?? optionIndex,
        resolvedChoice.rawId
      )
    }));

    const correctCount = options.filter((option) => option.isCorrect).length;
    return {
      id: `Q${question.id}`,
      domain: TRACK_CONFIG[track].domain,
      text: question.prompt || '',
      type: correctCount > 1 ? 'multiple' : 'single',
      options,
      hint: '',
      explanation: questionExplanation
    };
  });

  return questions;
}

function listTrackFiles(track) {
  return fs
    .readdirSync(RAW_DIR)
    .filter((name) => TRACK_CONFIG[track].pattern.test(name))
    .map((name) => ({
      name,
      fullPath: path.join(RAW_DIR, name),
      mtimeMs: fs.statSync(path.join(RAW_DIR, name)).mtimeMs
    }))
    .sort((a, b) => a.mtimeMs - b.mtimeMs || a.name.localeCompare(b.name));
}

function toExamObject(track, examNumber, questions) {
  const conf = TRACK_CONFIG[track];
  return {
    id: `${conf.idPrefix}${examNumber}`,
    title: `Practice Exam #${examNumber} (${conf.titleLabel})`,
    description: `Google Cloud Certified Professional ${conf.titleLabel} - ${questions.length} questions`,
    questions
  };
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const allExams = [];
const indexEntries = [];

for (const track of Object.keys(TRACK_CONFIG)) {
  const files = listTrackFiles(track);
  let examNumber = 1;

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(file.fullPath, 'utf8'));
    const parsedQuestions = parseExamPayload(raw, track);
    if (!parsedQuestions || parsedQuestions.length === 0) {
      continue;
    }

    const exam = toExamObject(track, examNumber, parsedQuestions);
    const outputFilename = `${TRACK_CONFIG[track].filenamePrefix}${examNumber}.json`;
    fs.writeFileSync(path.join(OUT_DIR, outputFilename), JSON.stringify(exam, null, 2));

    allExams.push(exam);
    indexEntries.push({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      questionCount: exam.questions.length,
      file: `./exams/${outputFilename}`
    });

    console.log(`Parsed ${exam.id} from ${file.name} with ${exam.questions.length} questions`);
    examNumber += 1;
  }
}

fs.writeFileSync(INDEX_FILE, JSON.stringify(indexEntries, null, 2));
fs.writeFileSync(LEGACY_AGGREGATE_FILE, JSON.stringify(allExams, null, 2));

console.log(`Wrote ${indexEntries.length} exam files, ${INDEX_FILE}, and ${LEGACY_AGGREGATE_FILE}`);
