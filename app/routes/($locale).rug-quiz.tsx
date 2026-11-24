import {json, type LoaderFunctionArgs, type MetaArgs} from '@shopify/remix-oxygen';
import {useEffect, useMemo, useState} from 'react';
import {useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {ProductCard} from '~/components/ProductCard';
import HallwayRug from '~/assets/quizimages/Quiz_Hallway_Rug.svg';

const RUG_QUIZ_COLOR_SWATCHES_QUERY = `#graphql
  query RugQuizColorSwatches($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    colorSwatches: metaobjects(type: "shopify--color-pattern", first: 50) {
      nodes {
        id
        handle
        fields {
          key
          value
          type
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
` as const;

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context as {storefront: any};
  const env = (context as any)?.env;
  const {colorSwatches} = await storefront.query(RUG_QUIZ_COLOR_SWATCHES_QUERY, {
    variables: {
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
  });
  return json({
    colorSwatches: colorSwatches ?? {nodes: []},
    storeDomain: env?.PUBLIC_STORE_DOMAIN,
  });
}

const heroImageUrl = HallwayRug;

const STEPS = [
  {
    id: 'style',
    stepLabel: 'Step 1/3',
    question: 'Which of these words best describe your style?',
    options: ['Cozy & Rustic', 'Minimalist & Modern', 'Classy & Elegant', 'Bold & Eclectic'],
  },
  {
    id: 'texture',
    stepLabel: 'Step 2/3',
    question: 'What kind of texture are you looking for?',
    options: ['Woven & Natural', 'Plush & Soft', 'Low Pile & Smooth', 'Textured & Sculpted'],
  },
  {
    id: 'lifestyle',
    stepLabel: 'Step 3/3',
    question: 'Do you have kids or pets?',
    options: ['Yes', 'No'],
  },
] as const;

type AnswerId = (typeof STEPS)[number]['id'];

function buildTagQuery(answersByStep: Partial<Record<AnswerId, string>>): string | null {
  const tags: string[] = [];

  // Tag mappings object
  const tagMap = {
    style: {
      'Cozy & Rustic': 'rustic',
      'Minimalist & Modern': 'modern',
      'Classy & Elegant': 'elegant',
      'Bold & Eclectic': 'eclectic',
    },
    texture: {
      'Woven & Natural': 'woven',
      'Plush & Soft': 'plush',
      'Low Pile & Smooth': 'lowpile',
      'Textured & Sculpted': 'textured',
    },
    lifestyle: {
      'Yes': 'kidfriendly',
      "No": '',
    },
  } as const;

  // Collect tags based on answers
  for (const stepKey of Object.keys(answersByStep) as Array<keyof typeof answersByStep>) {
    const answer = answersByStep[stepKey];
    if (answer && stepKey in tagMap) {
      const stepMapping = tagMap[stepKey] as Record<string, string>;
      if (answer in stepMapping) {
        const tag = stepMapping[answer];
        if (tag) { // Only add non-empty tags
          tags.push(tag);
        }
      }
    }
  }

  if (!tags.length) return null;

  // Build Shopify search query like: tag:"cozy-rustic" AND tag:"plush-soft" ...
  return tags
    .map((tag) => {
      const safe = String(tag).replace(/"/g, '\\"');
      return `tag:"${safe}"`;
    })
    .join(' AND ');
}

export const meta = ({matches}: MetaArgs) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Rug Visualizer Quiz - Find Your Perfect Rug'},
    {
      name: 'description',
      content: 'Answer a few quick questions and discover rug suggestions tailored to your style and lifestyle.',
    },
  ];
};

export default function RugQuizPage() {
  const {colorSwatches, storeDomain} = useLoaderData<typeof loader>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(STEPS.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const [recommended, setRecommended] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[currentStep];
  const allAnswered = answers.every((a) => a && a.length > 0);

  const handleSelect = (value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentStep] = value;
      return next;
    });
  };

  const handleNext = () => {
    if (!answers[currentStep]) return;
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else if (allAnswered) {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setAnswers(Array(STEPS.length).fill(null));
    setCurrentStep(0);
    setShowResults(false);
    setRecommended(null);
    setError(null);
  };

  const answersByStep = useMemo(() => {
    const map: Partial<Record<AnswerId, string>> = {};
    STEPS.forEach((s, idx) => {
      if (answers[idx]) map[s.id] = answers[idx] as string;
    });
    return map;
  }, [answers]);

  useEffect(() => {
    if (!showResults) return;

    const query = buildTagQuery(answersByStep);
    //console.log(query)
    if (!query) {
      setRecommended([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Call Remix data endpoint for routes/($locale).api.products so we get pure JSON, not the HTML document
    const dataRouteId = 'routes/($locale).api.products';
    const url = `/api/products?_data=${encodeURIComponent(dataRouteId)}&query=${encodeURIComponent(query)}&count=8`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: any) => {
        if (cancelled) return;
        const products = Array.isArray(data?.products) ? data.products : [];
        setRecommended(products);
      })
      .catch((e: any) => {
        if (cancelled) return;
        console.error('[Quiz] Failed to load recommendations', e);
        setError('Unable to load recommendations right now. Please try again later.');
        setRecommended([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showResults, answersByStep]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {!showResults ? (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1.6fr)] gap-0 md:gap-8 h-[460px] md:h-[560px]">
            {/* Left image / title */}
            <div className="relative h-full overflow-hidden">
              <img
                src={heroImageUrl}
                alt="Rug Visualizer Quiz"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="text-white font-cormorant text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                    <div>Rug</div>
                    <div>Visualizer</div>
                    <div>Quiz</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right question panel */}
            <div className="bg-white px-6 sm:px-10 py-8 sm:py-10 flex flex-col items-center justify-center h-full">
              <div className="w-full max-w-xl lg:max-w-2xl mx-auto">
                <p className="text-sm text-stone-500 mb-2 text-left">{step.stepLabel}</p>
                <h2 className="text-xl sm:text-2xl font-semibold text-stone-800 mb-10 text-left">
                  {step.question}
                </h2>

                <div className="mx-auto w-full max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {step.options.map((opt) => {
                      const selected = answers[currentStep] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelect(opt)}
                          className={`border text-sm sm:text-base px-4 py-3 text-left rounded-none shadow-sm transition-all duration-150 ${
                            selected
                              ? 'border-haniesta-brown bg-haniesta-brown text-white shadow-md translate-y-[-1px]'
                              : 'border-stone-300 bg-white text-stone-800 hover:border-haniesta-brown/70 hover:shadow-md hover:-translate-y-0.5'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full max-w-xl lg:max-w-2xl mx-auto mt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="text-xs text-stone-500 underline underline-offset-2 hover:text-stone-700"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!answers[currentStep]}
                  className="inline-flex items-center px-6 py-2.5 bg-haniesta-brown text-white text-sm font-medium disabled:bg-stone-300 disabled:cursor-not-allowed hover:bg-haniesta-brown/90"
                >
                  {currentStep === STEPS.length - 1 ? 'See results' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1.6fr)] gap-0 md:gap-8 h-[460px] md:h-[560px]">
            {/* Left thank-you image */}
            <div className="relative h-full overflow-hidden">
              <img
                src={heroImageUrl}
                alt="Thank you for taking the quiz"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <div className="text-white font-cormorant text-center">
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-light leading-tight">
                    <div>Thank you!</div>
                    <div>For taking the</div>
                    <div>Quiz</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right results panel */}
            <div className="bg-white px-6 sm:px-10 py-8 sm:py-10 flex flex-col h-full">
              <div className="w-full max-w-xl lg:max-w-2xl mx-auto flex flex-col flex-1">
                <div className="mb-6 text-left">
                  <h2 className="text-xl sm:text-2xl font-semibold text-stone-800 mb-2">
                    Here's list of Suggestions based on your inputs!
                  </h2>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    We picked these rugs using style, texture, and lifestyle tags that best match your choices.
                  </p>
                </div>

                <div className="mb-6 min-h-[140px]">
                  {loading && (
                    <p className="text-sm text-stone-500">Loading your personalized suggestions...</p>
                  )}
                  {error && !loading && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  {!loading && !error && recommended && recommended.length === 0 && (
                    <p className="text-sm text-stone-500 leading-relaxed">
                      We couldn't find any exact matches for your tags yet. Try exploring all rugs below while we
                      fine-tune the quiz.
                    </p>
                  )}

                  {recommended && recommended.length > 0 && (
                    <div className="overflow-x-auto pb-1">
                      <div className="flex gap-4 min-w-max">
                        {recommended.slice(0, 8).map((product: any) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 min-w-[160px] w-[160px] sm:min-w-[180px] sm:w-[180px] lg:min-w-[200px] lg:w-[200px]"
                          >
                            <ProductCard
                              product={product}
                              showReviewBadge={false}
                              quickAdd={false}
                              colorSwatchData={colorSwatches}
                              storeDomain={storeDomain}
                              fixedTitleLines={2}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="text-xs sm:text-sm text-stone-500 underline underline-offset-2 hover:text-stone-700"
                  >
                    Retake quiz
                  </button>
                  <a
                    href="/collections/all"
                    className="inline-flex items-center px-6 py-2.5 bg-haniesta-brown text-white text-sm font-medium hover:bg-haniesta-brown/90"
                  >
                    Explore more
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
