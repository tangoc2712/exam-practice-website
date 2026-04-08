const fs = require('fs');

let content = fs.readFileSync('src/components/screens/ScreenResults.tsx', 'utf8');

// Replace the option explanation check with question.explanation at the bottom
const targetBlock = `                          {(isCorrect || isSelected) && option.explanation && (
                            <div className={classNames(
                              "mt-3 pt-3 border-t text-xs leading-relaxed border-opacity-30",
                              isCorrect ? "border-neon-cyan text-cyan-200" : "border-neon-pink text-pink-200"
                            )}>
                              {option.explanation}
                            </div>
                          )}`;

const replacementBlock = ``;

content = content.replace(targetBlock, replacementBlock);
// Do it globally because map might have multiple? No, it's inside map.
content = content.split(targetBlock).join(replacementBlock);

// Now add the question.explanation block at the very bottom of the options map
const addTarget = `                    })}
                  </div>
                </div>`;

const addReplacement = `                    })}
                  </div>
                  {question.explanation && (
                    <div className="mt-4 p-4 rounded-sm border border-neon-cyan/30 bg-neon-cyan/5 text-cyan-100 text-sm leading-relaxed shadow-inner">
                      <h4 className="font-bold text-neon-cyan mb-2 tracking-wide uppercase text-xs">Explanation</h4>
                      <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                    </div>
                  )}
                </div>`;

content = content.replace(addTarget, addReplacement);

fs.writeFileSync('src/components/screens/ScreenResults.tsx', content);
