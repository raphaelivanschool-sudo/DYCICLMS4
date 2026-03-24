const TRANSMUTATION_TABLE = [
  { min: 97, max: 100, grade: 1.00, description: 'Excellent'    },
  { min: 94, max: 96,  grade: 1.25, description: 'Excellent'    },
  { min: 91, max: 93,  grade: 1.50, description: 'Very good'    },
  { min: 88, max: 90,  grade: 1.75, description: 'Very good'    },
  { min: 85, max: 87,  grade: 2.00, description: 'Good'         },
  { min: 82, max: 84,  grade: 2.25, description: 'Good'         },
  { min: 79, max: 81,  grade: 2.50, description: 'Satisfactory' },
  { min: 76, max: 78,  grade: 2.75, description: 'Satisfactory' },
  { min: 74, max: 75,  grade: 3.00, description: 'Passing'      },
  { min: 70, max: 73,  grade: 4.00, description: 'Conditional'  },
  { min: 0,  max: 69,  grade: 5.00, description: 'Failed'       },
];

export function computeRawScore(prelim, midterm, semiFinals, finals) {
  if (prelim == null || midterm == null || semiFinals == null || finals == null) {
    return null;
  }
  return (
    parseFloat(prelim)     * 0.25 +
    parseFloat(midterm)    * 0.25 +
    parseFloat(semiFinals) * 0.25 +
    parseFloat(finals)     * 0.25
  );
}

export function transmute(rawScore) {
  if (rawScore == null) return null;
  const clamped = Math.min(100, Math.max(0, rawScore));
  const entry = TRANSMUTATION_TABLE.find(
    (r) => clamped >= r.min && clamped <= r.max
  );
  return entry ? entry.grade : 5.00;
}

export function computeRemarks(transmutedGrade) {
  if (transmutedGrade == null)   return 'INC';
  if (transmutedGrade <= 3.00)   return 'PASSED';
  if (transmutedGrade === 4.00)  return 'CONDITIONAL';
  return 'FAILED';
}

export function processGrade(prelim, midterm, semiFinals, finals) {
  const raw             = computeRawScore(prelim, midterm, semiFinals, finals);
  const transmutedGrade = transmute(raw);
  const remarks         = computeRemarks(transmutedGrade);
  return { transmutedGrade, remarks };
}
