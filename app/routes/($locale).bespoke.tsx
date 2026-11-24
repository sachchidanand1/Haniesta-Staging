import {
  json,
  type MetaArgs,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {getSeoMeta} from '@shopify/hydrogen';
import {useLoaderData, Link, Form, useActionData, useNavigation} from '@remix-run/react';
import {useState, useEffect, useRef} from 'react';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {createMailgunService} from '~/lib/mailgun.server';
import BespokeHeroJpg from '~/assets/bespoke/bespoke_edition.jpg';
import Journey1Jpg from '~/assets/bespoke/journey_1.jpg';
import Journey2Png from '~/assets/bespoke/journey_2.png';
import Journey3Jpg from '~/assets/bespoke/journey_3.jpg';
import JuteRugJpg from '~/assets/bespoke/jute-rug.jpg';
import Journey4Png from '~/assets/bespoke/journey_4.png';
import {Image} from '~/components/Image';

export const headers = routeHeaders;

function hashCaptcha(answer: string, secret: string) {
  let hash = 0;
  const str = answer + secret;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash);
}

export async function action({request, context}: ActionFunctionArgs) {
  const formData = await request.formData();
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const message = formData.get('message');
  const captchaAnswer = formData.get('captchaAnswer');
  const captchaHash = formData.get('captchaHash');

  const normalizedMessage = typeof message === 'string' ? message : '';

  // Validate form data
  if (!fullName || !email || !phone || !captchaAnswer || !captchaHash) {
    return json(
      { success: false, message: '', error: 'Please fill in all required fields' },
      { status: 400 }
    );
  }

  // Validate captcha (secret sourced from env, with fallback for dev)
  const captchaSecret = (context as any)?.env?.CAPTCHA_SECRET || 'bespoke-captcha-key';
  if (hashCaptcha(String(captchaAnswer).trim(), captchaSecret) !== captchaHash) {
    return json(
      { success: false, message: '', error: 'Incorrect captcha answer. Please try again.' },
      { status: 400 }
    );
  }

  // Validate types
  if (typeof fullName !== 'string' || typeof email !== 'string' || typeof phone !== 'string') {
    return json(
      { success: false, message: '', error: 'Invalid form data' },
      { status: 400 }
    );
  }

  // Validate Name (only alphabets, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(fullName.trim())) {
    return json(
      { success: false, message: '', error: 'Name must only contain letters, spaces, hyphens, or apostrophes.' },
      { status: 400 }
    );
  }

  // Validate Email
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return json(
      { success: false, message: '', error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  // Prevent common spam email setups
  const lowercaseEmail = email.toLowerCase().trim();
  const spamEmails = new Set([
    'test@test.com', 'test@example.com', 'asdf@asdf.com', 'abc@abc.com', 'admin@admin.com',
    'spam@spam.com', 'bot@bot.com'
  ]);
  if (spamEmails.has(lowercaseEmail)) {
    return json(
      { success: false, message: '', error: 'Please enter a valid business email address.' },
      { status: 400 }
    );
  }

  const countryDialCode = (formData.get('countryDial') as string) || 'OTHER';
  const localPhone = (formData.get('localPhone') as string) || '';

  // Predefined country phone length bounds validation
  const countryMap: Record<string, { name: string, dial: string, min: number, max: number }> = {
    GB: { name: 'United Kingdom', dial: '+44', min: 10, max: 10 },
    US: { name: 'United States', dial: '+1', min: 10, max: 10 },
    IN: { name: 'India', dial: '+91', min: 10, max: 10 },
    DE: { name: 'Germany', dial: '+49', min: 10, max: 11 },
    FR: { name: 'France', dial: '+33', min: 9, max: 9 },
    AU: { name: 'Australia', dial: '+61', min: 9, max: 9 },
    AE: { name: 'United Arab Emirates', dial: '+971', min: 9, max: 9 },
    CA: { name: 'Canada', dial: '+1', min: 10, max: 10 },
    NL: { name: 'Netherlands', dial: '+31', min: 9, max: 9 },
    IE: { name: 'Ireland', dial: '+353', min: 9, max: 9 },
  };

  const digitsOnly = localPhone.replace(/[^0-9]/g, '');

  // Strip leading 0 if a country code is active (since the dial prefix is prepended by the form)
  let validatedDigits = digitsOnly;
  if (countryDialCode !== 'OTHER' && validatedDigits.startsWith('0')) {
    validatedDigits = validatedDigits.substring(1);
  }

  if (countryDialCode !== 'OTHER') {
    const rules = countryMap[countryDialCode];
    if (rules) {
      if (validatedDigits.length < rules.min || validatedDigits.length > rules.max) {
        return json(
          { success: false, message: '', error: `Phone number for ${rules.name} must be exactly ${rules.min === rules.max ? `${rules.min}` : `${rules.min}-${rules.max}`} digits long.` },
          { status: 400 }
        );
      }
    }
  } else {
    // For Other, ensure the phone digits are within a reasonable global range
    if (validatedDigits.length < 7 || validatedDigits.length > 15) {
      return json(
        { success: false, message: '', error: 'Phone number must contain between 7 and 15 digits.' },
        { status: 400 }
      );
    }
  }

  // Reject simple repeating digits or simple sequences
  const isRepeating = /^(\d)\1+$/.test(validatedDigits);
  const isSequential = '1234567890'.includes(validatedDigits) || '0123456789'.includes(validatedDigits) || '9876543210'.includes(validatedDigits);
  if (isRepeating || isSequential) {
    return json(
      { success: false, message: '', error: 'Please enter a valid phone number.' },
      { status: 400 }
    );
  }

  try {
    // Get admin email from environment (ADMIN_EMAIL must be set in .env)
    const adminEmail = (context as any)?.env?.ADMIN_EMAIL;
    
    // Create Mailgun service
    const mailgunService = createMailgunService((context as any)?.env);
    
    if (!mailgunService) {
      // Fallback to console logging if Mailgun is not configured
      // console.log('Mailgun not configured, logging form submission:');
      // console.log({
      //   type: 'Bespoke Form Submission',
      //   fullName,
      //   email,
      //   phone,
      //   message,
      //   timestamp: new Date().toISOString()
      // });
      
      return json({ 
        success: true, 
        message: 'Thank you! We will contact you soon.', 
        error: '' 
      });
    }

    // Send email via Mailgun
    const emailResult = await mailgunService.sendContactFormNotification(
      adminEmail,
      { fullName, email, phone, message: normalizedMessage },
      'Bespoke Inquiry'
    );

    if (emailResult.success) {
      //console.log('Bespoke form email sent successfully to:', adminEmail);
      return json({ 
        success: true, 
        message: 'Thank you! We will contact you soon.', 
        error: '' 
      });
    } else {
      console.error('Failed to send bespoke form email:', emailResult.error);
      
      // Still log the form submission for manual follow-up
      // console.log('Form submission logged for manual follow-up:', {
      //   fullName,
      //   email,
      //   phone,
      //   message,
      //   timestamp: new Date().toISOString()
      // });
      
      return json({ 
        success: true, 
        message: 'Thank you! We will contact you soon.', 
        error: '' 
      });
    }

  } catch (error) {
    console.error('Error processing bespoke form:', error);
    
    // Log form data for manual follow-up
    // console.log('Form submission logged due to error:', {
    //   fullName,
    //   email,
    //   phone,
    //   message,
    //   timestamp: new Date().toISOString(),
    //   error: error instanceof Error ? error.message : 'Unknown error'
    // });
    
    return json(
      { success: false, message: '', error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const seo = seoPayload.page({
    page: {
      title: 'Custom & Bespoke Rugs | Design Your Own Rug Online',
      seo: {
        title: 'Custom & Bespoke Rugs | Design Your Own Rug Online',
        description:
          'Create a custom rug designed for your space. Choose size including jute to design your own personalised or bespoke rug perfectly tailored to your home.',
      }
    },
    url: request.url
  });

  // Generate math captcha
  const num1 = Math.floor(Math.random() * 9) + 1;
  const num2 = Math.floor(Math.random() * 9) + 1;
  const captchaQuestion = `Please solve: ${num1} + ${num2} = ?`;
  const captchaSecret = (context as any)?.env?.CAPTCHA_SECRET || 'bespoke-captcha-key';
  const captchaHash = hashCaptcha(String(num1 + num2), captchaSecret);

  return json({
    seo,
    captchaQuestion,
    captchaHash,
  });
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoEntries = (matches || [])
    .map((m) => (m.data as any)?.seo)
    .filter(Boolean) as any[];
  if (seoEntries.length > 0) return getSeoMeta(...seoEntries);
  return [
    {title: 'Bespoke Edition - Custom Rugs'},
    {
      name: 'description',
      content:
        'Handcrafted to match your story. Create your perfect custom rug with our bespoke design service.',
    },
  ];
};

const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dial: '+44', min: 10, max: 10, placeholder: '7123 456789' },
  { code: 'US', name: 'United States', dial: '+1', min: 10, max: 10, placeholder: '201 555 0123' },
  { code: 'IN', name: 'India', dial: '+91', min: 10, max: 10, placeholder: '98765 43210' },
  { code: 'DE', name: 'Germany', dial: '+49', min: 10, max: 11, placeholder: '171 1234567' },
  { code: 'FR', name: 'France', dial: '+33', min: 9, max: 9, placeholder: '6 1234 5678' },
  { code: 'AU', name: 'Australia', dial: '+61', min: 9, max: 9, placeholder: '412 345 678' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', min: 9, max: 9, placeholder: '50 123 4567' },
  { code: 'CA', name: 'Canada', dial: '+1', min: 10, max: 10, placeholder: '613 555 0123' },
  { code: 'NL', name: 'Netherlands', dial: '+31', min: 9, max: 9, placeholder: '6 12345678' },
  { code: 'IE', name: 'Ireland', dial: '+353', min: 9, max: 9, placeholder: '87 123 4567' },
  { code: 'OTHER', name: 'Other', dial: '', min: 7, max: 15, placeholder: 'Enter full number' },
];

export default function BespokePage() {
  const { captchaQuestion, captchaHash } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [localPhoneVal, setLocalPhoneVal] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear form inputs and handle success message timeout after successful submission
  useEffect(() => {
    if (actionData?.success) {
      formRef.current?.reset();
      setLocalPhoneVal('');
      setSuccessMsg(actionData.message);
      
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <div className="bespoke-page min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[400px] flex items-center" style={{ backgroundColor: '#5A4A3A' }}>
        <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-16 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left - Sharp Full Square Image Container with Dark Bottom Overlay Bar */}
            <div className="relative w-full max-w-[420px] aspect-square lg:w-[420px] lg:flex-shrink-0 shadow-2xl overflow-hidden">
              <Image
                src={BespokeHeroJpg}
                alt="Bespoke Edition"
                containerClassName="w-full h-full aspect-square overflow-hidden"
                className="w-full h-full object-cover"
                loading="eager"
                sizes="(min-width: 1024px) 420px, 100vw"
              />
              {/* Text overlay with strong black text shadow behind text lines only */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                <p className="text-white text-xs sm:text-sm font-serif italic font-medium leading-relaxed tracking-wide [text-shadow:_0_2px_14px_rgba(0,0,0,1),_0_0_14px_rgba(0,0,0,0.95),_0_1px_4px_rgba(0,0,0,1)]">
                  Discover rugs made exclusively for you, tailored by master artisans to your desired size, material, colour palette and pattern. From concept sketch to final weave, every piece is thoughtfully crafted to reflect your space, your style, and your personal touch.
                </p>
              </div>
            </div>
            
            {/* Right - Text */}
            <div className="text-white flex-1 flex justify-center">
              <div className="text-left">
                <h1 className="text-7xl lg:text-8xl xl:text-9xl font-cormorant font-normal mb-6 tracking-wide leading-tight">
                  BESPOKE<br />EDITION
                </h1>
                <p className="text-3xl lg:text-4xl font-cormorant italic font-light text-white">
                  Handcrafted to match your story
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craft Your Rug Journey */}
      <section className="py-20 bg-white text-center">
        <div className="container mx-auto px-12 max-w-3xl">
          <h2 className="text-4xl lg:text-5xl font-cormorant font-normal tracking-wide text-haniesta-brown">
            Craft Your Rug Journey
          </h2>
          <div className="w-16 h-[1px] bg-haniesta-brown/30 mx-auto my-6"></div>
          <p className="text-haniesta-brown/70 text-lg font-serif italic max-w-xl mx-auto leading-relaxed">
            Follow along the steps to get a customized experience at your home
          </p>
        </div>
      </section>

      {/* Journey Steps Section */}
      <section className="py-12 sm:py-24 bg-[#FAF8F5]">
        <div className="container mx-auto px-6 sm:px-8 md:px-12 lg:px-16 max-w-7xl">
          <div className="space-y-24 sm:space-y-32">

            {/* Request Your Private Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 items-center">
              {/* Left - Image container with art framing */}
              <div className="w-full lg:col-span-7 overflow-hidden p-2 border border-haniesta-brown/10 bg-white">
                <div className="relative h-[350px] sm:h-[450px] lg:h-[500px] overflow-hidden">
                  <Image
                    src={Journey1Jpg}
                    alt="Private Preview"
                    className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
              {/* Right - Text Box with elegant overlap */}
              <div className="w-full lg:col-span-5 lg:-ml-20 relative z-10 -mt-16 sm:-mt-24 lg:mt-0 px-4 sm:px-8 lg:px-0">
                <div className="bg-haniesta-cream/90 backdrop-blur-md border border-haniesta-brown/10 p-5 sm:p-12 lg:p-16 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cormorant font-medium mb-6 text-haniesta-brown tracking-wide">
                    Request Your Private Preview
                  </h2>
                  <p className="text-haniesta-brown/80 leading-relaxed text-base font-serif italic">
                    Share your inspirations with us the colours you gravitate toward, the textures you love, and the mood you want your space to evoke. Haniesta carefully curates options that mirror your style and the atmosphere you're shaping within your home.
                  </p>
                </div>
              </div>
            </div>

            {/* We Bring Haniesta to You */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 items-center">
              {/* Left - Text Box with elegant overlap */}
              <div className="w-full lg:col-span-5 lg:-mr-20 relative z-10 -mt-16 sm:-mt-24 lg:mt-0 px-4 sm:px-8 lg:px-0 order-2 lg:order-1">
                <div className="bg-white/95 backdrop-blur-md border border-haniesta-brown/10 p-5 sm:p-12 lg:p-16 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cormorant font-medium mb-6 text-haniesta-brown tracking-wide">
                    We Bring Haniesta to You
                  </h2>
                  <p className="text-haniesta-brown/80 leading-relaxed text-base font-serif italic">
                    At a time that suits you, our specialists arrive with a handpicked selection of rugs. Each piece is handled with utmost care, allowing you to experience Haniesta craftsmanship within your own setting and natural light.
                  </p>
                </div>
              </div>
              {/* Right - Image container with art framing */}
              <div className="w-full lg:col-span-7 order-1 lg:order-2 overflow-hidden p-2 border border-haniesta-brown/10 bg-white">
                <div className="relative h-[350px] sm:h-[450px] lg:h-[500px] overflow-hidden">
                  <Image
                    src={JuteRugJpg}
                    alt="Home Visit"
                    className="w-full h-full object-cover object-[center_75%] transform hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
            </div>

            {/* Experience the Rugs in Your Space */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 items-center">
              {/* Left - Image container with art framing */}
              <div className="w-full lg:col-span-7 overflow-hidden p-2 border border-haniesta-brown/10 bg-white">
                <div className="relative h-[350px] sm:h-[450px] lg:h-[500px] overflow-hidden">
                  <Image
                    src={Journey3Jpg}
                    alt="Experience Rugs"
                    className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
              {/* Right - Text Box with elegant overlap */}
              <div className="w-full lg:col-span-5 lg:-ml-20 relative z-10 -mt-16 sm:-mt-24 lg:mt-0 px-4 sm:px-8 lg:px-0">
                <div className="bg-haniesta-cream/90 backdrop-blur-md border border-haniesta-brown/10 p-5 sm:p-12 lg:p-16 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cormorant font-medium mb-6 text-haniesta-brown tracking-wide">
                    Experience the Rugs in Your Space
                  </h2>
                  <p className="text-haniesta-brown/80 leading-relaxed text-base font-serif italic">
                    We lay out the rugs in their intended corners of your home, helping you see how pattern, proportion, and palette come to life in context. No guesswork, only true visual harmony.
                  </p>
                </div>
              </div>
            </div>

            {/* Select and Settle In */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-16 items-center">
              {/* Left - Text Box with elegant overlap */}
              <div className="w-full lg:col-span-5 lg:-mr-20 relative z-10 -mt-16 sm:-mt-24 lg:mt-0 px-4 sm:px-8 lg:px-0 order-2 lg:order-1">
                <div className="bg-white/95 backdrop-blur-md border border-haniesta-brown/10 p-5 sm:p-12 lg:p-16 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-cormorant font-medium mb-6 text-haniesta-brown tracking-wide">
                    Select and Settle In
                  </h2>
                  <p className="text-haniesta-brown/80 leading-relaxed text-base font-serif italic">
                    When you discover the rug that feels like it was made for your home, we take care of the rest, final placement, finishing touches, and styling so your Haniesta rug becomes a seamless part of your space's story from the very first day.
                  </p>
                </div>
              </div>
              {/* Right - Image container with art framing */}
              <div className="w-full lg:col-span-7 order-1 lg:order-2 overflow-hidden p-2 border border-haniesta-brown/10 bg-white">
                <div className="relative h-[350px] sm:h-[450px] lg:h-[500px] overflow-hidden">
                  <Image
                    src={Journey4Png}
                    alt="Settle In"
                    className="w-full h-full object-cover transform hover:scale-[1.03] transition-transform duration-700 ease-out"
                    loading="lazy"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Contact Form Section */}
      <section className="py-16 bg-white">
        {/* 
          Outer wrapper is styled with w-full max-w-full and px-6 xl:px-10 to expand edge-to-edge
          and align to the same horizontal starting margins as the main desktop header layout.
        */}
        <div className="w-full mx-auto px-8 md:px-12 lg:px-6 xl:px-10 max-w-full">
          <div className="grid lg:grid-cols-[40%_60%] gap-0 items-stretch">
            {/* 
              Left Form Column:
              Offsetting with lg:pl-[80px] shifts inputs horizontally so they align exactly under
              the letter 'E' in the main 'HANIESTA' header logo on all desktop viewports.
            */}
            <div className="bg-white px-0 py-10 sm:px-10 lg:py-16 lg:pl-[80px] lg:pr-24 max-w-md mx-auto lg:max-w-none">
              <h2 className="text-3xl lg:text-4xl font-cormorant font-medium mb-10 text-haniesta-brown">
                Connect with our experts today!
              </h2>
              
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6 animate-fadeIn">
                  {successMsg}
                </div>
              )}
              
              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
                  {actionData.error}
                </div>
              )}
              
              <Form ref={formRef} method="post" className="space-y-8">
                <div>
                  <label className="block text-sm text-haniesta-brown/70 mb-2 font-medium">
                    Full Name
                    <span className="ml-1 text-[#B5704F]">*</span>
                  </label>
                  <input 
                    type="text"
                    name="fullName"
                    placeholder="Enter Name"
                    required
                    pattern="[a-zA-Z\s'\-]+"
                    title="Name must contain only letters and spaces."
                    className="w-full border border-haniesta-brown/20 bg-white px-4 py-3 focus:outline-none focus:border-haniesta-brown text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-haniesta-brown/70 mb-2 font-medium">
                    Email
                    <span className="ml-1 text-[#B5704F]">*</span>
                  </label>
                  <input 
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    required
                    className="w-full border border-haniesta-brown/20 bg-white px-4 py-3 focus:outline-none focus:border-haniesta-brown text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-haniesta-brown/70 mb-2 font-medium">
                    Phone Number
                    <span className="ml-1 text-[#B5704F]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="countryDial"
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const found = COUNTRIES.find(c => c.code === e.target.value);
                        if (found) {
                          setSelectedCountry(found);
                          setLocalPhoneVal('');
                        }
                      }}
                      className="border border-haniesta-brown/20 bg-white px-3 py-3 focus:outline-none focus:border-haniesta-brown text-sm w-[130px] rounded-none cursor-pointer"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code === 'OTHER' ? 'Other' : `${c.code} (${c.dial})`}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="tel"
                      name="localPhone"
                      value={localPhoneVal}
                      onChange={(e) => setLocalPhoneVal(e.target.value.replace(/[^0-9\s\-()]/g, ''))}
                      placeholder={selectedCountry.placeholder}
                      required
                      className="flex-1 border border-haniesta-brown/20 bg-white px-4 py-3 focus:outline-none focus:border-haniesta-brown text-sm"
                    />
                  </div>
                  <input type="hidden" name="phone" value={selectedCountry.code === 'OTHER' ? localPhoneVal : `${selectedCountry.dial}${localPhoneVal}`} />
                  <p className="mt-1.5 text-xs text-haniesta-brown/50">
                    {selectedCountry.code === 'OTHER' 
                      ? 'Please enter your phone number with country code.' 
                      : `Expected length: ${selectedCountry.min === selectedCountry.max ? `${selectedCountry.min} digits` : `${selectedCountry.min}-${selectedCountry.max} digits`}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-haniesta-brown/70 mb-2 font-medium">
                    Message
                    <span className="ml-2 text-xs text-haniesta-brown/50">(optional)</span>
                  </label>
                  <textarea 
                    rows={5}
                    name="message"
                    placeholder="Enter Message (optional)"
                    className="w-full border border-haniesta-brown/20 bg-white px-4 py-3 focus:outline-none focus:border-haniesta-brown resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-haniesta-brown/70 mb-2 font-medium">
                    Security Verification: {captchaQuestion}
                  </label>
                  <input 
                    key={captchaHash}
                    type="number"
                    name="captchaAnswer"
                    placeholder="Enter your answer"
                    required
                    className="w-full border border-haniesta-brown/20 bg-white px-4 py-3 focus:outline-none focus:border-haniesta-brown text-sm"
                  />
                  <input type="hidden" name="captchaHash" value={captchaHash} />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-haniesta-brown text-white px-10 py-3 hover:bg-haniesta-brown/90 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </Form>
            </div>

            {/* Right - Image with overlay */}
            <div className="relative h-[600px] lg:h-auto max-w-md mx-auto lg:max-w-none w-full">
              <Image
                src={Journey2Png}
                alt="Lets Work Together"
                className="w-full h-full object-cover"
                loading="lazy"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              {/* Overlay text */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="bg-[#A15937]/70 p-10 lg:p-12 max-w-lg">
                  <p className="text-white text-xl lg:text-2xl font-cormorant italic leading-relaxed text-center">
                    Designed for those who prefer exclusivity, our in-residence previews offer a private, expertly guided selection experience  refined, discreet, and deeply personalized.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
