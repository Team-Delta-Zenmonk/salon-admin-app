
export const getStorefrontDomain = (): string => {
  return import.meta.env.VITE_STOREFRONT_DOMAIN || "salon.com";
};

export const getStorefrontUrl = (slug?: string): string => {
  const isDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const devBaseUrl = import.meta.env.VITE_STOREFRONT_URL || "http://localhost:3001";
  const baseDomain = getStorefrontDomain();

  // if (isDev) {
  //   return slug ? `${devBaseUrl}/?salon=${slug}` : devBaseUrl;
  // }
  return devBaseUrl;
  // return slug ? `https://${slug}.${baseDomain}` : `https://${baseDomain}`;
};

export const getSubdomainDisplay = (slug: string): string => {
  return `${slug}.${getStorefrontDomain()}`;
};
