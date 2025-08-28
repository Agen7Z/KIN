export const sendEmailViaEmailJS = async (templateId, templateParams = {}, options = {}) => {
  const serviceId = options.serviceId || process.env.EMAILJS_SERVICE_ID;
  const publicKey = options.publicKey || process.env.EMAILJS_PUBLIC_KEY;
  if (!serviceId || !publicKey || !templateId) {
    // Silently skip sending if not configured
    return { skipped: true };
  }
  const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`EmailJS failed (${res.status}): ${text}`);
  }
  return { ok: true };
};

export default sendEmailViaEmailJS;


