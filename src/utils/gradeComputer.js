const TRANSMUTATION_TABLE = [
  { min: 97, max: 100, grade: 1.00 },
  { min: 94, max: 96,  grade: 1.25 },
  { min: 91, max: 93,  grade: 1.50 },
  { min: 88, max: 90,  grade: 1.75 },
  { min: 85, max: 87,  grade: 2.00 },
  { min: 82, max: 84,  grade: 2.25 },
  { min: 79, max: 81,  grade: 2.50 },
  { min: 76, max: 78,  grade: 2.75 },
  { min: 74, max: 75,  grade: 3.00 },
  { min: 70, max: 73,  grade: 4.00 },
  { min: 0,  max: 69,  grade: 5.00 },
];

export function transmute(rawScore) {
  if (rawScore == null || isNaN(rawScore)) return null;
  const clamped = Math.min(100, Math.max(0, rawScore));
  const entry = TRANSMUTATION_TABLE.find((r) => clamped >= r.min && clamped <= r.max);
  return entry ? entry.grade : 5.00;
}

export function computeRemarks(transmutedGrade) {
  if (transmutedGrade == null)  return 'INC';
  if (transmutedGrade <= 3.00)  return 'PASSED';
  if (transmutedGrade === 4.00) return 'CONDITIONAL';
  return 'FAILED';
}

export function previewGrade(prelim, midterm, semiFinals, finals) {
  const vals = [prelim, midterm, semiFinals, finals].map((v) => parseFloat(v));
  if (vals.some((v) => isNaN(v))) return { transmutedGrade: null, remarks: 'INC' };
  const raw = vals.reduce((sum, v) => sum + v, 0) / 4;
  const transmutedGrade = transmute(raw);
  return { transmutedGrade, remarks: computeRemarks(transmutedGrade) };
}
