import {useRef, useState} from 'react';
import {useLoaderData} from '@remix-run/react';
import clsx from 'clsx';
import {Button} from '~/components/Button';
import type {loader as productRouteLoader} from '~/routes/($locale).products.$productHandle';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function JudgeMeReviewForm({
  showForm,
  setShowForm,
  className,
}: {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
}) {
  const {product} = useLoaderData<typeof productRouteLoader>();
  const [rating, setRating] = useState<number>(0);
  const [formState, setFormState] = useState<FormState>('idle');
  const formRef = useRef<HTMLFormElement>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);

  function resetForm() {
    setRating(0);
    setFormState('idle');
    formRef.current?.reset();
  }

  async function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!ev.currentTarget.checkValidity()) return;

    setFormState('submitting');
    try {
      const formData = new FormData(ev.currentTarget);
      formData.set('rating', String(rating));
      const res = await fetch(`/api/product/${encodeURIComponent(product.handle)}/reviews`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Response not ok');
      await res.json().catch(() => null);
      setFormState('success');
    } catch (e) {
      console.error('Error submitting review:', e);
      setFormState('error');
    }
  }

  const colorVar = 'var(--color-product-reviews)';

  function Star({filled}: {filled: boolean}) {
    return (
      <svg
        viewBox="0 0 20 20"
        className={`h-6 w-6 ${filled ? '' : 'text-gray-300'}`}
        fill="currentColor"
        aria-hidden
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.802-2.035a1 1 0 00-1.175 0l-2.802 2.035c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  return (
    <div
      className={clsx(
        'w-full space-y-6 border border-gray-200 shadow p-6 transition-all duration-200 md:p-8 bg-white relative z-10',
        showForm ? 'block' : 'hidden',
        className,
      )}
    >
      {/* Success state */}
      <div
        className={clsx('space-y-4 py-4 text-center', formState === 'success' ? 'block' : 'hidden')}
        role="alert"
        aria-live="polite"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="h-8 w-8 text-green-600">✓</span>
        </div>
        <h3 className="mb-2 font-semibold text-green-900 text-xl">Review Submitted Successfully!</h3>
        <p className="text-gray-600">
          Thank you for your feedback. Your review is being processed and will be published shortly.
        </p>
        <Button type="button" onClick={resetForm} className="mt-4">
          Write Another Review
        </Button>
      </div>

      {/* Error state */}
      <div
        className={clsx('space-y-4 py-4 text-center', formState === 'error' ? 'block' : 'hidden')}
        role="alert"
        aria-live="polite"
      >
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="h-8 w-8 text-red-600">!</span>
        </div>
        <h3 className="mb-2 font-semibold text-red-900 text-xl">Submission Failed</h3>
        <p className="text-gray-600">There was an error submitting your review. Please try again.</p>
        <Button type="button" onClick={() => setShowForm(false)} className="mt-4">
          Close
        </Button>
      </div>

      {/* Form */}
      <form
        ref={formRef}
        id="judgeme-review-form"
        onSubmit={handleSubmit}
        className={clsx('space-y-6', formState === 'idle' || formState === 'submitting' ? 'block' : 'hidden')}
      >
        <div className="space-y-2">
          <h2 className="text-center font-bold text-2xl text-gray-900">Write Your Review</h2>
          <p className="text-center text-gray-600">Share your experience with other customers</p>
        </div>

        {/* Hidden product ID input (Shopify numeric id) */}
        <input type="hidden" name="id" value={Number(product.id.split('/').pop())} />

        {/* Rating */}
        <div className="space-y-2">
          <label className="block font-medium text-gray-700 text-sm">
            Rating <span className="ml-1 text-red-500">*</span>
          </label>
          <div className="inline-flex items-center gap-2" style={{color: colorVar}}>
            {[1, 2, 3, 4, 5].map((i) => {
              const active = i <= (hoverRating || rating);
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i} star${i > 1 ? 's' : ''}`}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`p-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-transform duration-200 ${active ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <Star filled={active} />
                </button>
              );
            })}
          </div>
          <input type="hidden" name="rating" value={rating} />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="judgeme-reviewer-name" className="block font-medium text-gray-700 text-sm">
            Your Name <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="judgeme-reviewer-name"
            placeholder="Enter your name"
            required
            className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="judgeme-reviewer-email" className="block font-medium text-gray-700 text-sm">
            Email Address <span className="ml-1 text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="judgeme-reviewer-email"
            placeholder="Enter your email"
            required
            className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Review Title */}
        <div className="space-y-2">
          <label htmlFor="judgeme-review-title" className="block font-medium text-gray-700 text-sm">
            Review Title
          </label>
          <input
            type="text"
            name="title"
            id="judgeme-review-title"
            placeholder="Give your review a title"
            className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Review Body */}
        <div className="space-y-2">
          <label htmlFor="judgeme-review-body" className="block font-medium text-gray-700 text-sm">
            Your Review <span className="ml-1 text-red-500">*</span>
          </label>
          <textarea
            name="body"
            id="judgeme-review-body"
            required
            placeholder="Share your experience with this product"
            rows={5}
            className="w-full border border-gray-300 px-4 py-3 text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={formState === 'submitting'}>
            {formState === 'submitting' ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
}
