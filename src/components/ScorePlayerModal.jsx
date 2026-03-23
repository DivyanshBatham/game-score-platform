import { useState, useMemo, useEffect, useRef } from 'react';

const NUMBER_CARDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MODIFIERS = [
  { id: 'x2', label: '×2' },
  { id: '+2', label: '+2' },
  { id: '+4', label: '+4' },
  { id: '+6', label: '+6' },
  { id: '+8', label: '+8' },
  { id: '+10', label: '+10' },
];

function calculateScore(numbers, hasX2, addModifiers, flip7) {
  if (numbers.length === 0 && !hasX2 && addModifiers === 0 && !flip7) return 0;
  let sum = numbers.reduce((a, b) => a + b, 0);
  if (hasX2) sum *= 2;
  sum += addModifiers;
  if (flip7) sum += 15;
  return sum;
}

export function ScorePlayerModal({ playerName, initialSelection, onDone, onCancel }) {
  const [numberCards, setNumberCards] = useState([]);
  const [x2, setX2] = useState(false);
  const [addMods, setAddMods] = useState([]);
  const [flip7, setFlip7] = useState(false);
  const [bust, setBust] = useState(false);
  const [showMaxCardsFeedback, setShowMaxCardsFeedback] = useState(false);
  const maxCardsFeedbackTimerRef = useRef(null);

  useEffect(() => {
    if (!initialSelection) return;
    setNumberCards(Array.isArray(initialSelection.numberCards) ? initialSelection.numberCards.slice(0, 7) : []);
    setX2(!!initialSelection.x2);
    setAddMods(Array.isArray(initialSelection.addMods) ? initialSelection.addMods : []);
    setBust(!!initialSelection.bust);
  }, [initialSelection]);

  const toggleNumber = (n) => {
    if (bust) return;
    setNumberCards((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 7) {
        setShowMaxCardsFeedback(true);
        if (maxCardsFeedbackTimerRef.current) clearTimeout(maxCardsFeedbackTimerRef.current);
        maxCardsFeedbackTimerRef.current = setTimeout(() => {
          setShowMaxCardsFeedback(false);
          maxCardsFeedbackTimerRef.current = null;
        }, 2000);
        return prev; // max 7 number cards
      }
      return [...prev, n].sort((a, b) => a - b);
    });
  };

  // Auto-select Flip 7 when exactly 7 unique number cards are selected
  useEffect(() => {
    setFlip7(numberCards.length === 7);
  }, [numberCards.length]);

  useEffect(() => {
    return () => {
      if (maxCardsFeedbackTimerRef.current) clearTimeout(maxCardsFeedbackTimerRef.current);
    };
  }, []);

  const toggleAddMod = (id) => {
    if (bust) return;
    setAddMods((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addModifierValue = useMemo(() => {
    return addMods.reduce((acc, id) => {
      const n = parseInt(id.slice(1), 10);
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }, [addMods]);

  const score = useMemo(() => {
    if (bust) return 0;
    return calculateScore(numberCards, x2, addModifierValue, flip7);
  }, [bust, numberCards, x2, addModifierValue, flip7]);

  const handleBust = () => {
    setBust(true);
    setNumberCards([]);
    setAddMods([]);
    setX2(false);
    setFlip7(false);
  };

  const handleClearBust = () => {
    setBust(false);
  };

  const handleDone = () => {
    onDone({
      score,
      selection: {
        numberCards,
        x2,
        addMods,
        bust,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCancel}>
      <div
        className="bg-flip-blue rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-flip-yellow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-flip-yellow mb-4 text-center">
            Score: {playerName}
          </h2>

          {bust ? (
            <div className="text-center py-6">
              <p className="text-flip-cream text-lg font-semibold mb-4">Bust! 0 points this round.</p>
              <button
                type="button"
                onClick={handleClearBust}
                className="px-6 py-2 rounded-lg bg-flip-yellow/20 text-flip-yellow border border-flip-yellow"
              >
                Undo bust
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-flip-cream/90 text-sm font-medium mb-2">Number cards</p>
                <div className="flex flex-wrap gap-2 items-center">
                  {NUMBER_CARDS.map((n) => {
                    const selected = numberCards.includes(n);
                    const atMax = numberCards.length >= 7 && !selected;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNumber(n)}
                        title={atMax ? 'Maximum 7 number cards. Remove one to add another.' : undefined}
                        className={`w-12 h-12 rounded-xl font-bold text-lg transition ${
                          selected
                            ? 'bg-flip-yellow text-flip-blue-dark ring-2 ring-flip-yellow-dark'
                            : atMax
                              ? 'bg-flip-blue-light/50 text-flip-cream/50 opacity-80'
                              : 'bg-flip-blue-light text-flip-cream hover:bg-flip-blue-light/80'
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  {(showMaxCardsFeedback || numberCards.length === 7) && (
                    <span
                      className={`text-sm font-medium ml-1 ${
                        showMaxCardsFeedback
                          ? 'text-flip-yellow animate-pulse'
                          : 'text-flip-cream/80'
                      }`}
                    >
                      {showMaxCardsFeedback
                        ? 'Max 7 cards. Remove one to add another.'
                        : '7 selected (max). Tap to remove.'}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-flip-cream/90 text-sm font-medium mb-2">Modifiers</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setX2((v) => !v)}
                    className={`px-4 py-3 rounded-xl font-bold transition ${
                      x2 ? 'bg-flip-yellow text-flip-blue-dark' : 'bg-flip-blue-light text-flip-cream hover:bg-flip-blue-light/80'
                    }`}
                  >
                    ×2
                  </button>
                  {MODIFIERS.filter((m) => m.id !== 'x2').map((m) => {
                    const selected = addMods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleAddMod(m.id)}
                        className={`px-4 py-3 rounded-xl font-bold transition ${
                          selected ? 'bg-flip-yellow text-flip-blue-dark' : 'bg-flip-blue-light text-flip-cream hover:bg-flip-blue-light/80'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6 flex items-center gap-3">
                <span
                  className={`inline-flex px-4 py-3 rounded-xl font-bold ${
                    flip7 ? 'bg-flip-yellow text-flip-blue-dark' : 'bg-flip-blue-light text-flip-cream'
                  }`}
                >
                  Flip 7 (+15)
                </span>
                <span className="text-flip-cream/80 text-sm">
                  {numberCards.length} unique number cards
                </span>
              </div>

              <button
                type="button"
                onClick={handleBust}
                className="w-full py-2 rounded-lg border-2 border-red-400 text-red-300 hover:bg-red-400/20 mb-4"
              >
                Bust (0 points)
              </button>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-flip-yellow text-flip-yellow font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="flex-1 py-3 rounded-xl bg-flip-yellow text-flip-blue-dark font-bold"
            >
              Done — {score} pts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
